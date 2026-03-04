using System.ComponentModel.DataAnnotations;

namespace Resenha.API.DTOs.Auth
{
    // Dados necessarios para criar uma nova conta
    public class RegisterRequestDTO
    {
        [Required(ErrorMessage = "Nome e obrigatorio.")]
        [MinLength(2, ErrorMessage = "Nome deve ter pelo menos 2 caracteres.")]
        [MaxLength(120, ErrorMessage = "Nome deve ter no maximo 120 caracteres.")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email e obrigatorio.")]
        [EmailAddress(ErrorMessage = "Email invalido.")]
        [MaxLength(180, ErrorMessage = "Email deve ter no maximo 180 caracteres.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Senha e obrigatoria.")]
        [MinLength(8, ErrorMessage = "Senha deve ter pelo menos 8 caracteres.")]
        [MaxLength(120, ErrorMessage = "Senha deve ter no maximo 120 caracteres.")]
        public string Senha { get; set; } = string.Empty;

        public bool Goleiro { get; set; } = false;

        [MaxLength(20)]
        public string? TimeCoracaoCodigo { get; set; }
    }
}
