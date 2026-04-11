using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace Resenha.API.Infrastructure.Email
{
    public class ResendEmailSender : IEmailSender
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<ResendEmailSender> _logger;

        public ResendEmailSender(
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory,
            ILogger<ResendEmailSender> logger)
        {
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task SendAsync(
            EmailMessage message,
            CancellationToken cancellationToken = default)
        {
            var apiKey = GetSetting("EmailSettings:Resend:ApiKey", "RESEND_API_KEY");
            var fromEmail = GetSetting("EmailSettings:FromEmail", "EMAIL_FROM");
            var fromName = GetSetting("EmailSettings:FromName", "EMAIL_FROM_NAME") ?? "Resenha";

            if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(fromEmail))
                throw new InvalidOperationException("Resend nao configurado.");

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var payload = new
            {
                from = $"{fromName} <{fromEmail}>",
                to = new[] { message.ToEmail },
                subject = message.Subject,
                text = message.TextBody,
                html = message.HtmlBody
            };

            using var response = await client.PostAsJsonAsync(
                "https://api.resend.com/emails",
                payload,
                cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("EMAIL_SENT | provider=resend to={ToEmail}", message.ToEmail);
                return;
            }

            var errorText = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError(
                "EMAIL_SEND_FAILED | provider=resend status={Status} to={ToEmail} error={Error}",
                (int)response.StatusCode,
                message.ToEmail,
                errorText);

            throw new InvalidOperationException($"Falha ao enviar e-mail via Resend. Status {(int)response.StatusCode}.");
        }

        private string? GetSetting(string configKey, string envKey)
        {
            var env = Environment.GetEnvironmentVariable(envKey);
            return string.IsNullOrWhiteSpace(env) ? _configuration[configKey] : env;
        }
    }
}
