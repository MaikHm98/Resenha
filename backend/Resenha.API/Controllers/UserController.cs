using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Resenha.API.DTOs.Auth;
using Resenha.API.Helpers;
using Resenha.API.Services;
using System.Net;
using System.Security.Claims;

namespace Resenha.API.Controllers
{
    // Endpoints de autenticação: cadastro e login
    [ApiController]
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly IWebHostEnvironment _environment;
        private readonly IHttpClientFactory _httpClientFactory;

        public UserController(AuthService authService, IWebHostEnvironment environment, IHttpClientFactory httpClientFactory)
        {
            _authService = authService;
            _environment = environment;
            _httpClientFactory = httpClientFactory;
        }

        private ulong GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return ulong.Parse(claim!);
        }

        // POST /api/users/register
        // Cria uma nova conta de usuário
        [HttpPost("register")]
        [AllowAnonymous]
        public IActionResult Register([FromBody] RegisterRequestDTO request)
        {
            try
            {
                var response = _authService.Register(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        // POST /api/users/login
        // Autentica o usuário e retorna o token JWT
        [HttpPost("login")]
        [AllowAnonymous]
        public IActionResult Login([FromBody] LoginRequestDTO request)
        {
            try
            {
                var response = _authService.Login(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        // POST /api/users/forgot-password
        // Solicita recuperacao de senha por e-mail.
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public IActionResult ForgotPassword([FromBody] ForgotPasswordRequestDTO request)
        {
            try
            {
                var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
                var debugRequested = string.Equals(
                    Request.Headers["X-Debug-Reset-Token"].ToString(),
                    "true",
                    StringComparison.OrdinalIgnoreCase);

                var token = _authService.RequestPasswordReset(request, ip);
                if (_environment.IsDevelopment() && debugRequested && !string.IsNullOrWhiteSpace(token))
                    return Ok(new
                    {
                        mensagem = "Se o e-mail existir, voce recebera instrucoes para redefinir a senha.",
                        debugToken = token
                    });

                return Ok(new { mensagem = "Se o e-mail existir, voce recebera instrucoes para redefinir a senha." });
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        // GET /api/users/reset-password/validate?token=...
        [HttpGet("reset-password/validate")]
        [AllowAnonymous]
        public IActionResult ValidateResetToken([FromQuery] string token)
        {
            try
            {
                var valido = _authService.ValidatePasswordResetToken(token);
                return Ok(new { valido });
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        // POST /api/users/reset-password
        [HttpPost("reset-password")]
        [AllowAnonymous]
        public IActionResult ResetPassword([FromBody] ResetPasswordRequestDTO request)
        {
            try
            {
                var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
                _authService.ResetPassword(request, ip);
                return Ok(new { mensagem = "Senha redefinida com sucesso." });
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        // GET /api/users/clubs
        [HttpGet("clubs")]
        [AllowAnonymous]
        public IActionResult GetClubs()
        {
            try
            {
                return Ok(_authService.GetClubOptions());
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        // GET /api/users/clubs/logo?url=...
        // Proxy para escudos dos clubes, evitando bloqueios de carregamento em alguns dispositivos.
        [HttpGet("clubs/logo")]
        [AllowAnonymous]
        public async Task<IActionResult> GetClubLogo([FromQuery] string url)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(url))
                    throw new Exception("URL do escudo e obrigatoria.");

                if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
                    throw new Exception("URL do escudo invalida.");

                if (uri.Scheme != Uri.UriSchemeHttps)
                    throw new Exception("Somente URLs https sao permitidas.");

                var allowedHosts = new[] { "logodetimes.com", "upload.wikimedia.org" };
                if (!allowedHosts.Any(h => string.Equals(uri.Host, h, StringComparison.OrdinalIgnoreCase)))
                    throw new Exception("Host de escudo nao permitido.");

                var client = _httpClientFactory.CreateClient();
                using var response = await client.GetAsync(uri);
                if (response.StatusCode == HttpStatusCode.NotFound)
                    return NotFound(new { mensagem = "Escudo nao encontrado." });

                if (!response.IsSuccessStatusCode)
                    return StatusCode((int)response.StatusCode, new { mensagem = "Falha ao carregar escudo." });

                var bytes = await response.Content.ReadAsByteArrayAsync();
                var contentType = response.Content.Headers.ContentType?.MediaType ?? "image/png";
                return File(bytes, contentType);
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }

        // PATCH /api/users/profile
        [HttpPatch("profile")]
        [Authorize]
        public IActionResult UpdateProfile([FromBody] UpdateProfileRequestDTO request)
        {
            try
            {
                var response = _authService.UpdateProfile(GetUserId(), request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return this.ToErrorResult(ex);
            }
        }
    }
}
