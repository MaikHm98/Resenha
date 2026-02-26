using System.ComponentModel.DataAnnotations;

namespace Resenha.API.DTOs.Groups
{
    public class InviteUserDTO
    {
        [Required(ErrorMessage = "Email do convidado é obrigatório.")]
        [EmailAddress(ErrorMessage = "Email inválido.")]
        public string EmailConvidado { get; set; } = string.Empty;
    }
}
