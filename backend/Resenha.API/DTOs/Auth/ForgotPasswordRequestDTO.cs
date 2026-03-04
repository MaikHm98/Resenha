using System.ComponentModel.DataAnnotations;

namespace Resenha.API.DTOs.Auth
{
    public class ForgotPasswordRequestDTO
    {
        [Required(ErrorMessage = "Email e obrigatorio.")]
        [EmailAddress(ErrorMessage = "Email invalido.")]
        [MaxLength(180, ErrorMessage = "Email deve ter no maximo 180 caracteres.")]
        public string Email { get; set; } = string.Empty;
    }
}
