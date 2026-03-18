using System.ComponentModel.DataAnnotations;

namespace Resenha.API.DTOs.Auth
{
    public class ChangePasswordRequestDTO
    {
        [Required(ErrorMessage = "Senha atual e obrigatoria.")]
        public string SenhaAtual { get; set; } = string.Empty;

        [Required(ErrorMessage = "Nova senha e obrigatoria.")]
        [MinLength(8, ErrorMessage = "Nova senha deve ter pelo menos 8 caracteres.")]
        [MaxLength(120, ErrorMessage = "Nova senha deve ter no maximo 120 caracteres.")]
        public string NovaSenha { get; set; } = string.Empty;
    }
}
