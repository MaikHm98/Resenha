using System.ComponentModel.DataAnnotations;

namespace Resenha.API.DTOs.Auth
{
    public class UpdateProfileRequestDTO
    {
        [MinLength(2, ErrorMessage = "Nome deve ter pelo menos 2 caracteres.")]
        [MaxLength(120, ErrorMessage = "Nome deve ter no maximo 120 caracteres.")]
        public string? Nome { get; set; }

        public bool? Goleiro { get; set; }

        [MaxLength(20)]
        public string? TimeCoracaoCodigo { get; set; }
    }
}
