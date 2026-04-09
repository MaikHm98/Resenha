using System.ComponentModel.DataAnnotations;

namespace Resenha.API.DTOs.Matches
{
    public class AddGuestToMatchDTO
    {
        [Required(ErrorMessage = "O nome do convidado e obrigatorio.")]
        [MaxLength(120, ErrorMessage = "O nome do convidado deve ter no maximo 120 caracteres.")]
        public string Nome { get; set; } = string.Empty;
    }
}
