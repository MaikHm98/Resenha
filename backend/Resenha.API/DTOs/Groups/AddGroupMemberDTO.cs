using System.ComponentModel.DataAnnotations;

namespace Resenha.API.DTOs.Groups
{
    public class AddGroupMemberDTO
    {
        [Required(ErrorMessage = "Email é obrigatório.")]
        [EmailAddress(ErrorMessage = "Email inválido.")]
        public string Email { get; set; } = string.Empty;
    }
}
