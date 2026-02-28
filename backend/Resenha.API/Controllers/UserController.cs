using Microsoft.AspNetCore.Mvc;
using Resenha.API.DTOs.Auth;
using Resenha.API.Helpers;
using Resenha.API.Services;

namespace Resenha.API.Controllers
{
    // Endpoints de autenticação: cadastro e login
    [ApiController]
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        private readonly AuthService _authService;

        public UserController(AuthService authService)
        {
            _authService = authService;
        }

        // POST /api/users/register
        // Cria uma nova conta de usuário
        [HttpPost("register")]
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
    }
}
