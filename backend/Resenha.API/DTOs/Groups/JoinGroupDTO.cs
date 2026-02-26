using System.ComponentModel.DataAnnotations;

namespace Resenha.API.DTOs.Groups
{
    public class JoinGroupDTO
    {
        [Required(ErrorMessage = "Código do convite é obrigatório.")]
        public string CodigoConvite { get; set; } = string.Empty;
    }
}
