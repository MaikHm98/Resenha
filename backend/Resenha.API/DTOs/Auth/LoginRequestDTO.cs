namespace Resenha.API.DTOs.Auth
{
    // Dados necessários para fazer login
    public class LoginRequestDTO
    {
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
    }
}
