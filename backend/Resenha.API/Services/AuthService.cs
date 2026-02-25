using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Resenha.API.Data;
using Resenha.API.DTOs.Auth;
using Resenha.API.Entities;
using Resenha.API.Helpers;

namespace Resenha.API.Services
{
    // Serviço responsável por cadastro, login e geração de token JWT
    public class AuthService
    {
        private readonly ResenhaDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ResenhaDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // Cadastrar novo usuário
        public AuthResponseDTO Register(RegisterRequestDTO request)
        {
            // Verifica se o email já está em uso
            if (_context.Usuarios.Any(u => u.Email == request.Email))
                throw new Exception("Email já cadastrado.");

            var usuario = new Usuario
            {
                Nome = request.Nome,
                Email = request.Email,
                SenhaHash = PasswordHelper.HashPassword(request.Senha)
            };

            _context.Usuarios.Add(usuario);
            _context.SaveChanges();

            var token = GenerateJwtToken(usuario);

            return new AuthResponseDTO
            {
                Token = token,
                IdUsuario = usuario.IdUsuario,
                Nome = usuario.Nome,
                Email = usuario.Email
            };
        }

        // Fazer login com email e senha
        public AuthResponseDTO Login(LoginRequestDTO request)
        {
            var usuario = _context.Usuarios
                .FirstOrDefault(u => u.Email == request.Email && u.Ativo);

            if (usuario == null)
                throw new Exception("Usuário não encontrado.");

            if (!PasswordHelper.VerifyPassword(request.Senha, usuario.SenhaHash))
                throw new Exception("Senha inválida.");

            var token = GenerateJwtToken(usuario);

            return new AuthResponseDTO
            {
                Token = token,
                IdUsuario = usuario.IdUsuario,
                Nome = usuario.Nome,
                Email = usuario.Email
            };
        }

        // Gera o token JWT com as informações do usuário
        private string GenerateJwtToken(Usuario usuario)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!)
            );
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Claims são as informações embutidas no token
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.IdUsuario.ToString()),
                new Claim(ClaimTypes.Email, usuario.Email),
                new Claim(ClaimTypes.Name, usuario.Nome)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(
                    int.Parse(jwtSettings["ExpirationMinutes"]!)
                ),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
