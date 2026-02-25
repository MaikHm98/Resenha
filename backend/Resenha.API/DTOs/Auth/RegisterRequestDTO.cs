namespace Resenha.API.DTOs.Auth
{
    // Dados necessários para criar uma nova conta
    public class RegisterRequestDTO
    {
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
    }
}
