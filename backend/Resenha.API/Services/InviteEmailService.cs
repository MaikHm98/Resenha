using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Http.Json;
using System.Net.Mail;

namespace Resenha.API.Services
{
    public class InviteSendResult
    {
        public bool Sent { get; set; }
        public bool Configured { get; set; }
        public string Provider { get; set; } = "none";
        public string? Error { get; set; }
    }

    public interface IInviteEmailService
    {
        InviteSendResult SendGroupInvite(string toEmail, string inviterName, string groupName, string inviteLink, DateTime expiresAtUtc);
        InviteSendResult SendPasswordReset(string toEmail, string userName, string resetLink, DateTime expiresAtUtc);
    }

    public class InviteEmailService : IInviteEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<InviteEmailService> _logger;
        private readonly IHttpClientFactory _httpClientFactory;

        public InviteEmailService(
            IConfiguration configuration,
            ILogger<InviteEmailService> logger,
            IHttpClientFactory httpClientFactory)
        {
            _configuration = configuration;
            _logger = logger;
            _httpClientFactory = httpClientFactory;
        }

        public InviteSendResult SendGroupInvite(string toEmail, string inviterName, string groupName, string inviteLink, DateTime expiresAtUtc)
        {
            var provider = (GetSetting("EmailSettings:Provider", "EMAIL_PROVIDER") ?? "smtp").Trim().ToLowerInvariant();
            return provider switch
            {
                "sendgrid" => SendWithSendGrid(toEmail, inviterName, groupName, inviteLink, expiresAtUtc),
                "smtp" => SendWithSmtp(toEmail, inviterName, groupName, inviteLink, expiresAtUtc),
                _ => new InviteSendResult
                {
                    Sent = false,
                    Configured = false,
                    Provider = provider,
                    Error = "Provider de e-mail invalido."
                }
            };
        }

        public InviteSendResult SendPasswordReset(string toEmail, string userName, string resetLink, DateTime expiresAtUtc)
        {
            var provider = (GetSetting("EmailSettings:Provider", "EMAIL_PROVIDER") ?? "smtp").Trim().ToLowerInvariant();
            return provider switch
            {
                "sendgrid" => SendPasswordResetWithSendGrid(toEmail, userName, resetLink, expiresAtUtc),
                "smtp" => SendPasswordResetWithSmtp(toEmail, userName, resetLink, expiresAtUtc),
                _ => new InviteSendResult
                {
                    Sent = false,
                    Configured = false,
                    Provider = provider,
                    Error = "Provider de e-mail invalido."
                }
            };
        }

        private InviteSendResult SendWithSmtp(string toEmail, string inviterName, string groupName, string inviteLink, DateTime expiresAtUtc)
        {
            var host = GetSetting("EmailSettings:Host", "EMAIL_SMTP_HOST");
            var fromEmail = GetSetting("EmailSettings:FromEmail", "EMAIL_FROM");
            var fromName = GetSetting("EmailSettings:FromName", "EMAIL_FROM_NAME") ?? "Resenha";
            var username = GetSetting("EmailSettings:Username", "EMAIL_SMTP_USERNAME");
            var password = GetSetting("EmailSettings:Password", "EMAIL_SMTP_PASSWORD");
            var portText = GetSetting("EmailSettings:Port", "EMAIL_SMTP_PORT");
            var sslText = GetSetting("EmailSettings:EnableSsl", "EMAIL_SMTP_ENABLE_SSL");

            if (string.IsNullOrWhiteSpace(host) ||
                string.IsNullOrWhiteSpace(fromEmail) ||
                string.IsNullOrWhiteSpace(username) ||
                string.IsNullOrWhiteSpace(password))
            {
                _logger.LogWarning(
                    "INVITE_EMAIL_SKIPPED_NO_SMTP_CONFIG | to={ToEmail} link={InviteLink} expiresAt={ExpiresAtUtc}",
                    toEmail, inviteLink, expiresAtUtc);
                return new InviteSendResult { Sent = false, Configured = false, Provider = "smtp", Error = "SMTP nao configurado." };
            }

            var port = 587;
            if (!string.IsNullOrWhiteSpace(portText) && int.TryParse(portText, out var parsedPort))
                port = parsedPort;

            var enableSsl = true;
            if (!string.IsNullOrWhiteSpace(sslText) && bool.TryParse(sslText, out var parsedSsl))
                enableSsl = parsedSsl;

            var subject = $"Convite para entrar no grupo {groupName}";
            var body = BuildTextBody(inviterName, groupName, inviteLink, expiresAtUtc);

            try
            {
                using var message = new MailMessage
                {
                    From = new MailAddress(fromEmail, fromName),
                    Subject = subject,
                    Body = body
                };
                message.To.Add(toEmail);

                using var smtp = new SmtpClient(host, port)
                {
                    EnableSsl = enableSsl,
                    Credentials = new NetworkCredential(username, password)
                };

                smtp.Send(message);

                _logger.LogInformation("INVITE_EMAIL_SENT | provider=smtp to={ToEmail} group={GroupName}", toEmail, groupName);
                return new InviteSendResult { Sent = true, Configured = true, Provider = "smtp" };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "INVITE_EMAIL_SEND_FAILED | provider=smtp to={ToEmail} link={InviteLink}", toEmail, inviteLink);
                return new InviteSendResult { Sent = false, Configured = true, Provider = "smtp", Error = ex.Message };
            }
        }

        private InviteSendResult SendWithSendGrid(string toEmail, string inviterName, string groupName, string inviteLink, DateTime expiresAtUtc)
        {
            var apiKey = GetSetting("EmailSettings:SendGrid:ApiKey", "EMAIL_SENDGRID_API_KEY");
            var fromEmail = GetSetting("EmailSettings:FromEmail", "EMAIL_FROM");
            var fromName = GetSetting("EmailSettings:FromName", "EMAIL_FROM_NAME") ?? "Resenha";

            if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(fromEmail))
            {
                _logger.LogWarning("INVITE_EMAIL_SKIPPED_NO_SENDGRID_CONFIG | to={ToEmail}", toEmail);
                return new InviteSendResult { Sent = false, Configured = false, Provider = "sendgrid", Error = "SendGrid nao configurado." };
            }

            var subject = $"Convite para entrar no grupo {groupName}";
            var textBody = BuildTextBody(inviterName, groupName, inviteLink, expiresAtUtc);
            var htmlBody = BuildHtmlBody(inviterName, groupName, inviteLink, expiresAtUtc);

            try
            {
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

                var payload = new
                {
                    personalizations = new[]
                    {
                        new
                        {
                            to = new[] { new { email = toEmail } },
                            subject
                        }
                    },
                    from = new { email = fromEmail, name = fromName },
                    content = new[]
                    {
                        new { type = "text/plain", value = textBody },
                        new { type = "text/html", value = htmlBody }
                    }
                };

                var response = client.PostAsJsonAsync("https://api.sendgrid.com/v3/mail/send", payload).GetAwaiter().GetResult();
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("INVITE_EMAIL_SENT | provider=sendgrid to={ToEmail} group={GroupName}", toEmail, groupName);
                    return new InviteSendResult { Sent = true, Configured = true, Provider = "sendgrid" };
                }

                var errorText = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                _logger.LogError(
                    "INVITE_EMAIL_SEND_FAILED | provider=sendgrid status={Status} to={ToEmail} error={Error}",
                    (int)response.StatusCode, toEmail, errorText);

                return new InviteSendResult
                {
                    Sent = false,
                    Configured = true,
                    Provider = "sendgrid",
                    Error = $"Status {(int)response.StatusCode}: {SafeTruncate(errorText, 300)}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "INVITE_EMAIL_SEND_FAILED | provider=sendgrid to={ToEmail}", toEmail);
                return new InviteSendResult { Sent = false, Configured = true, Provider = "sendgrid", Error = ex.Message };
            }
        }

        private InviteSendResult SendPasswordResetWithSmtp(string toEmail, string userName, string resetLink, DateTime expiresAtUtc)
        {
            var host = GetSetting("EmailSettings:Host", "EMAIL_SMTP_HOST");
            var fromEmail = GetSetting("EmailSettings:FromEmail", "EMAIL_FROM");
            var fromName = GetSetting("EmailSettings:FromName", "EMAIL_FROM_NAME") ?? "Resenha";
            var username = GetSetting("EmailSettings:Username", "EMAIL_SMTP_USERNAME");
            var password = GetSetting("EmailSettings:Password", "EMAIL_SMTP_PASSWORD");
            var portText = GetSetting("EmailSettings:Port", "EMAIL_SMTP_PORT");
            var sslText = GetSetting("EmailSettings:EnableSsl", "EMAIL_SMTP_ENABLE_SSL");

            if (string.IsNullOrWhiteSpace(host) ||
                string.IsNullOrWhiteSpace(fromEmail) ||
                string.IsNullOrWhiteSpace(username) ||
                string.IsNullOrWhiteSpace(password))
            {
                _logger.LogWarning(
                    "PASSWORD_RESET_EMAIL_SKIPPED_NO_SMTP_CONFIG | to={ToEmail} link={ResetLink} expiresAt={ExpiresAtUtc}",
                    toEmail,
                    resetLink,
                    expiresAtUtc);
                return new InviteSendResult { Sent = false, Configured = false, Provider = "smtp", Error = "SMTP nao configurado." };
            }

            var port = 587;
            if (!string.IsNullOrWhiteSpace(portText) && int.TryParse(portText, out var parsedPort))
                port = parsedPort;

            var enableSsl = true;
            if (!string.IsNullOrWhiteSpace(sslText) && bool.TryParse(sslText, out var parsedSsl))
                enableSsl = parsedSsl;

            var subject = "Redefinicao de senha - Resenha";
            var body = BuildResetTextBody(userName, resetLink, expiresAtUtc);

            try
            {
                using var message = new MailMessage
                {
                    From = new MailAddress(fromEmail, fromName),
                    Subject = subject,
                    Body = body
                };
                message.To.Add(toEmail);

                using var smtp = new SmtpClient(host, port)
                {
                    EnableSsl = enableSsl,
                    Credentials = new NetworkCredential(username, password)
                };

                smtp.Send(message);
                _logger.LogInformation("PASSWORD_RESET_EMAIL_SENT | provider=smtp to={ToEmail}", toEmail);
                return new InviteSendResult { Sent = true, Configured = true, Provider = "smtp" };
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "PASSWORD_RESET_EMAIL_SEND_FAILED | provider=smtp to={ToEmail} link={ResetLink} expiresAt={ExpiresAtUtc}",
                    toEmail,
                    resetLink,
                    expiresAtUtc);
                return new InviteSendResult { Sent = false, Configured = true, Provider = "smtp", Error = ex.Message };
            }
        }

        private InviteSendResult SendPasswordResetWithSendGrid(string toEmail, string userName, string resetLink, DateTime expiresAtUtc)
        {
            var apiKey = GetSetting("EmailSettings:SendGrid:ApiKey", "EMAIL_SENDGRID_API_KEY");
            var fromEmail = GetSetting("EmailSettings:FromEmail", "EMAIL_FROM");
            var fromName = GetSetting("EmailSettings:FromName", "EMAIL_FROM_NAME") ?? "Resenha";

            if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(fromEmail))
            {
                _logger.LogWarning(
                    "PASSWORD_RESET_EMAIL_SKIPPED_NO_SENDGRID_CONFIG | to={ToEmail} link={ResetLink} expiresAt={ExpiresAtUtc}",
                    toEmail,
                    resetLink,
                    expiresAtUtc);
                return new InviteSendResult { Sent = false, Configured = false, Provider = "sendgrid", Error = "SendGrid nao configurado." };
            }

            var subject = "Redefinicao de senha - Resenha";
            var textBody = BuildResetTextBody(userName, resetLink, expiresAtUtc);
            var htmlBody = BuildResetHtmlBody(userName, resetLink, expiresAtUtc);

            try
            {
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

                var payload = new
                {
                    personalizations = new[]
                    {
                        new
                        {
                            to = new[] { new { email = toEmail } },
                            subject
                        }
                    },
                    from = new { email = fromEmail, name = fromName },
                    content = new[]
                    {
                        new { type = "text/plain", value = textBody },
                        new { type = "text/html", value = htmlBody }
                    }
                };

                var response = client.PostAsJsonAsync("https://api.sendgrid.com/v3/mail/send", payload).GetAwaiter().GetResult();
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("PASSWORD_RESET_EMAIL_SENT | provider=sendgrid to={ToEmail}", toEmail);
                    return new InviteSendResult { Sent = true, Configured = true, Provider = "sendgrid" };
                }

                var errorText = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                _logger.LogError(
                    "PASSWORD_RESET_EMAIL_SEND_FAILED | provider=sendgrid status={Status} to={ToEmail} link={ResetLink} expiresAt={ExpiresAtUtc} error={Error}",
                    (int)response.StatusCode, toEmail, resetLink, expiresAtUtc, errorText);

                return new InviteSendResult
                {
                    Sent = false,
                    Configured = true,
                    Provider = "sendgrid",
                    Error = $"Status {(int)response.StatusCode}: {SafeTruncate(errorText, 300)}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "PASSWORD_RESET_EMAIL_SEND_FAILED | provider=sendgrid to={ToEmail} link={ResetLink} expiresAt={ExpiresAtUtc}",
                    toEmail,
                    resetLink,
                    expiresAtUtc);
                return new InviteSendResult { Sent = false, Configured = true, Provider = "sendgrid", Error = ex.Message };
            }
        }

        private static string BuildTextBody(string inviterName, string groupName, string inviteLink, DateTime expiresAtUtc)
        {
            return
                $"Ola!\n\n" +
                $"{inviterName} convidou voce para entrar no grupo \"{groupName}\" no app Resenha.\n\n" +
                $"Use este link para abrir o app e concluir seu cadastro/entrada:\n{inviteLink}\n\n" +
                $"Este convite expira em {expiresAtUtc:dd/MM/yyyy HH:mm} UTC.\n\n" +
                $"Se voce nao esperava este convite, ignore este e-mail.";
        }

        private static string BuildHtmlBody(string inviterName, string groupName, string inviteLink, DateTime expiresAtUtc)
        {
            return $@"
<html>
  <body style='font-family: Arial, sans-serif; color: #111;'>
    <p>Ola!</p>
    <p><strong>{WebUtility.HtmlEncode(inviterName)}</strong> convidou voce para entrar no grupo
      <strong>{WebUtility.HtmlEncode(groupName)}</strong> no app Resenha.</p>
    <p>
      <a href='{WebUtility.HtmlEncode(inviteLink)}' style='display:inline-block;padding:10px 16px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:8px;'>
        Abrir convite
      </a>
    </p>
    <p>Ou copie e cole este link:<br/>{WebUtility.HtmlEncode(inviteLink)}</p>
    <p>Este convite expira em {expiresAtUtc:dd/MM/yyyy HH:mm} UTC.</p>
    <p>Se voce nao esperava este convite, ignore este e-mail.</p>
  </body>
</html>";
        }

        private static string BuildResetTextBody(string userName, string resetLink, DateTime expiresAtUtc)
        {
            return
                $"Ola, {userName}!\n\n" +
                $"Recebemos um pedido para redefinir sua senha no app Resenha.\n\n" +
                $"Use este link para redefinir sua senha:\n{resetLink}\n\n" +
                $"Este link expira em {expiresAtUtc:dd/MM/yyyy HH:mm} UTC.\n" +
                $"Se voce nao solicitou, ignore este e-mail.";
        }

        private static string BuildResetHtmlBody(string userName, string resetLink, DateTime expiresAtUtc)
        {
            return $@"
<html>
  <body style='font-family: Arial, sans-serif; color: #111;'>
    <p>Ola, <strong>{WebUtility.HtmlEncode(userName)}</strong>!</p>
    <p>Recebemos um pedido para redefinir sua senha no app Resenha.</p>
    <p>
      <a href='{WebUtility.HtmlEncode(resetLink)}' style='display:inline-block;padding:10px 16px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:8px;'>
        Redefinir senha
      </a>
    </p>
    <p>Ou copie e cole este link:<br/>{WebUtility.HtmlEncode(resetLink)}</p>
    <p>Este link expira em {expiresAtUtc:dd/MM/yyyy HH:mm} UTC.</p>
    <p>Se voce nao solicitou esta acao, ignore este e-mail.</p>
  </body>
</html>";
        }

        private static string SafeTruncate(string text, int max)
        {
            if (string.IsNullOrEmpty(text)) return text;
            return text.Length <= max ? text : text.Substring(0, max);
        }

        private string? GetSetting(string configKey, string envKey)
        {
            var env = Environment.GetEnvironmentVariable(envKey);
            if (!string.IsNullOrWhiteSpace(env)) return env;
            return _configuration[configKey];
        }
    }
}
