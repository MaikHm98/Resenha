using Microsoft.IdentityModel.Tokens;
using Resenha.API.Data;
using Resenha.API.DTOs.Auth;
using Resenha.API.Entities;
using Resenha.API.Helpers;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Resenha.API.Services
{
    // Servico responsavel por cadastro, login, token JWT, recuperacao de senha e perfil.
    public class AuthService
    {
        private readonly ResenhaDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IInviteEmailService _inviteEmailService;

        public AuthService(
            ResenhaDbContext context,
            IConfiguration configuration,
            IInviteEmailService inviteEmailService)
        {
            _context = context;
            _configuration = configuration;
            _inviteEmailService = inviteEmailService;
        }

        public AuthResponseDTO Register(RegisterRequestDTO request)
        {
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();

            if (_context.Usuarios.Any(u => u.Email.ToLower() == normalizedEmail))
                throw new Exception("Email ja cadastrado.");

            if (!PasswordPolicyHelper.IsStrong(request.Senha))
                throw new Exception("Senha deve ter no minimo 8 caracteres, 1 numero e 1 letra maiuscula.");

            var club = ClubCatalog.GetByCode(request.TimeCoracaoCodigo);
            if (!string.IsNullOrWhiteSpace(request.TimeCoracaoCodigo) && club == null)
                throw new Exception("Time do coracao invalido.");

            var usuario = new Usuario
            {
                Nome = request.Nome.Trim(),
                Email = normalizedEmail,
                SenhaHash = PasswordHelper.HashPassword(request.Senha),
                Goleiro = request.Goleiro,
                TimeCoracaoCodigo = club?.Codigo,
                AtualizadoEm = DateTime.UtcNow
            };

            _context.Usuarios.Add(usuario);
            _context.SaveChanges();

            var token = GenerateJwtToken(usuario);

            return MapAuthResponse(usuario, token);
        }

        public AuthResponseDTO Login(LoginRequestDTO request)
        {
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();

            var usuario = _context.Usuarios
                .FirstOrDefault(u => u.Email.ToLower() == normalizedEmail && u.Ativo);

            if (usuario == null)
                throw new Exception("Usuario nao encontrado.");

            if (!PasswordHelper.VerifyPassword(request.Senha, usuario.SenhaHash))
                throw new Exception("Senha invalida.");

            var token = GenerateJwtToken(usuario);
            return MapAuthResponse(usuario, token);
        }

        public string? RequestPasswordReset(ForgotPasswordRequestDTO request, string? ipOrigem)
        {
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var now = DateTime.UtcNow;

            if (!string.IsNullOrWhiteSpace(ipOrigem))
            {
                var totalPorIp = _context.AuditoriasSeguranca
                    .Count(a =>
                        a.Acao == "PASSWORD_RESET_REQUEST_CREATED" &&
                        a.IpOrigem == ipOrigem &&
                        a.CriadoEm >= now.AddMinutes(-15));

                if (totalPorIp >= 20)
                    throw new Exception("Muitas solicitacoes deste dispositivo. Tente novamente em alguns minutos.");
            }

            var usuario = _context.Usuarios
                .FirstOrDefault(u => u.Email.ToLower() == normalizedEmail && u.Ativo);

            if (usuario == null)
            {
                AddAudit("PASSWORD_RESET_REQUEST_EMAIL_NOT_FOUND", null, normalizedEmail, ipOrigem, "email_nao_cadastrado");
                _context.SaveChanges();
                return null;
            }

            var totalRecentes = _context.TokensRecuperacaoSenha
                .Count(t => t.IdUsuario == usuario.IdUsuario && t.CriadoEm >= now.AddMinutes(-15));

            if (totalRecentes >= 5)
            {
                AddAudit("PASSWORD_RESET_REQUEST_RATE_LIMIT", usuario.IdUsuario, usuario.Email, ipOrigem, "limite_15min");
                _context.SaveChanges();
                throw new Exception("Muitas solicitacoes de recuperacao. Tente novamente em alguns minutos.");
            }

            var tokenPlain = GenerateSecureToken();
            var tokenHash = HashToken(tokenPlain);
            var expiraEm = now.AddMinutes(15);

            _context.TokensRecuperacaoSenha.Add(new TokenRecuperacaoSenha
            {
                IdUsuario = usuario.IdUsuario,
                TokenHash = tokenHash,
                ExpiraEm = expiraEm,
                IpSolicitacao = ipOrigem
            });

            var resetLink = BuildResetLink(tokenPlain);
            _inviteEmailService.SendPasswordReset(usuario.Email, usuario.Nome, resetLink, expiraEm);

            AddAudit("PASSWORD_RESET_REQUEST_CREATED", usuario.IdUsuario, usuario.Email, ipOrigem, "token_emitido");
            _context.SaveChanges();
            return tokenPlain;
        }

        public bool ValidatePasswordResetToken(string token)
        {
            var now = DateTime.UtcNow;
            var tokenHash = HashToken(token);

            return _context.TokensRecuperacaoSenha
                .Any(t => t.TokenHash == tokenHash && t.UsadoEm == null && t.ExpiraEm >= now);
        }

        public void ResetPassword(ResetPasswordRequestDTO request, string? ipOrigem)
        {
            if (!PasswordPolicyHelper.IsStrong(request.NovaSenha))
                throw new Exception("Senha deve ter no minimo 8 caracteres, 1 numero e 1 letra maiuscula.");

            var now = DateTime.UtcNow;
            var tokenHash = HashToken(request.Token);

            var tokenEntity = _context.TokensRecuperacaoSenha
                .FirstOrDefault(t => t.TokenHash == tokenHash);

            if (tokenEntity == null)
            {
                AddAudit("PASSWORD_RESET_INVALID_TOKEN", null, null, ipOrigem, "token_nao_encontrado");
                _context.SaveChanges();
                throw new Exception("Token de recuperacao invalido.");
            }

            tokenEntity.TentativasValidacao += 1;
            if (tokenEntity.TentativasValidacao > 5)
            {
                tokenEntity.UsadoEm = now;
                AddAudit("PASSWORD_RESET_TOKEN_TOO_MANY_ATTEMPTS", tokenEntity.IdUsuario, null, ipOrigem, "tentativas_excedidas");
                _context.SaveChanges();
                throw new Exception("Token de recuperacao bloqueado por excesso de tentativas.");
            }

            if (tokenEntity.UsadoEm.HasValue)
            {
                AddAudit("PASSWORD_RESET_TOKEN_ALREADY_USED", tokenEntity.IdUsuario, null, ipOrigem, "token_ja_usado");
                _context.SaveChanges();
                throw new Exception("Token de recuperacao ja foi utilizado.");
            }

            if (tokenEntity.ExpiraEm < now)
            {
                AddAudit("PASSWORD_RESET_TOKEN_EXPIRED", tokenEntity.IdUsuario, null, ipOrigem, "token_expirado");
                _context.SaveChanges();
                throw new Exception("Token de recuperacao expirado.");
            }

            var usuario = _context.Usuarios
                .FirstOrDefault(u => u.IdUsuario == tokenEntity.IdUsuario && u.Ativo);

            if (usuario == null)
            {
                AddAudit("PASSWORD_RESET_USER_NOT_FOUND", tokenEntity.IdUsuario, null, ipOrigem, "usuario_inativo_ou_inexistente");
                _context.SaveChanges();
                throw new Exception("Usuario nao encontrado.");
            }

            usuario.SenhaHash = PasswordHelper.HashPassword(request.NovaSenha);
            usuario.AtualizadoEm = now;

            tokenEntity.UsadoEm = now;

            var outrosTokens = _context.TokensRecuperacaoSenha
                .Where(t => t.IdUsuario == usuario.IdUsuario && t.UsadoEm == null && t.IdToken != tokenEntity.IdToken)
                .ToList();

            foreach (var t in outrosTokens)
                t.UsadoEm = now;

            AddAudit("PASSWORD_RESET_SUCCESS", usuario.IdUsuario, usuario.Email, ipOrigem, "senha_redefinida");
            _context.SaveChanges();
        }

        public AuthResponseDTO UpdateProfile(ulong userId, UpdateProfileRequestDTO request)
        {
            var usuario = _context.Usuarios.FirstOrDefault(u => u.IdUsuario == userId && u.Ativo)
                ?? throw new Exception("Usuario nao encontrado.");

            if (request.Goleiro.HasValue)
                usuario.Goleiro = request.Goleiro.Value;

            if (request.TimeCoracaoCodigo != null)
            {
                var code = request.TimeCoracaoCodigo.Trim().ToUpperInvariant();
                if (string.IsNullOrWhiteSpace(code))
                {
                    usuario.TimeCoracaoCodigo = null;
                }
                else
                {
                    var club = ClubCatalog.GetByCode(code)
                        ?? throw new Exception("Time do coracao invalido.");

                    usuario.TimeCoracaoCodigo = club.Codigo;
                }
            }

            _context.SaveChanges();

            // Mantem o token atual. O front atualiza apenas metadados locais.
            return MapAuthResponse(usuario, string.Empty);
        }

        public List<ClubOptionDTO> GetClubOptions()
            => ClubCatalog.GetAll();

        private AuthResponseDTO MapAuthResponse(Usuario usuario, string token)
        {
            var club = ClubCatalog.GetByCode(usuario.TimeCoracaoCodigo);
            return new AuthResponseDTO
            {
                Token = token,
                IdUsuario = usuario.IdUsuario,
                Nome = usuario.Nome,
                Email = usuario.Email,
                Goleiro = usuario.Goleiro,
                TimeCoracaoCodigo = club?.Codigo,
                TimeCoracaoNome = club?.Nome,
                TimeCoracaoEscudoUrl = club?.EscudoUrl
            };
        }

        private string GenerateJwtToken(Usuario usuario)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var pwdAtTicks = BuildPasswordStamp(usuario.AtualizadoEm ?? usuario.CriadoEm);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.IdUsuario.ToString()),
                new Claim(ClaimTypes.Email, usuario.Email),
                new Claim(ClaimTypes.Name, usuario.Nome),
                new Claim("pwd_at", pwdAtTicks)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(int.Parse(jwtSettings["ExpirationMinutes"]!)),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private void AddAudit(string acao, ulong? idUsuario, string? emailRef, string? ipOrigem, string? detalhes)
        {
            _context.AuditoriasSeguranca.Add(new AuditoriaSeguranca
            {
                Acao = acao,
                IdUsuario = idUsuario,
                EmailReferencia = emailRef,
                IpOrigem = ipOrigem,
                Detalhes = detalhes
            });
        }

        private string BuildResetLink(string token)
        {
            var template = _configuration["PasswordResetSettings:ResetLinkTemplate"];
            if (string.IsNullOrWhiteSpace(template))
                template = "resenha://reset-password?token={token}";

            return template.Replace("{token}", Uri.EscapeDataString(token));
        }

        private static string GenerateSecureToken()
        {
            var bytes = RandomNumberGenerator.GetBytes(32);
            return Convert.ToBase64String(bytes)
                .Replace('+', '-')
                .Replace('/', '_')
                .TrimEnd('=');
        }

        private static string HashToken(string token)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
            return Convert.ToHexString(bytes);
        }

        // Mantem o claim pwd_at estavel entre valor em memoria e valor lido do MySQL.
        private static string BuildPasswordStamp(DateTime value)
        {
            var utc = value.Kind == DateTimeKind.Utc
                ? value
                : DateTime.SpecifyKind(value, DateTimeKind.Utc);

            return new DateTimeOffset(utc).ToUnixTimeSeconds().ToString();
        }
    }
}
