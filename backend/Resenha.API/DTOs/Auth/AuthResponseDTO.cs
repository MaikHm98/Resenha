namespace Resenha.API.DTOs.Auth
{
    // Resposta retornada após login ou cadastro bem-sucedido
    public class AuthResponseDTO
    {
        public string Token { get; set; } = string.Empty;
        public ulong IdUsuario { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool Goleiro { get; set; }
        public string? TimeCoracaoCodigo { get; set; }
        public string? TimeCoracaoNome { get; set; }
        public string? TimeCoracaoEscudoUrl { get; set; }
        public string? PosicaoPrincipal { get; set; }
        public string? PeDominante { get; set; }
    }
}
