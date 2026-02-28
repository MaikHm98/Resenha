using System.ComponentModel.DataAnnotations;

namespace Resenha.API.DTOs.Groups
{
    public class UpdateGroupMemberRoleDTO
    {
        [Required(ErrorMessage = "Perfil é obrigatório.")]
        [RegularExpression("^(ADMIN|JOGADOR)$", ErrorMessage = "Perfil deve ser ADMIN ou JOGADOR.")]
        public string Perfil { get; set; } = "JOGADOR";
    }
}
