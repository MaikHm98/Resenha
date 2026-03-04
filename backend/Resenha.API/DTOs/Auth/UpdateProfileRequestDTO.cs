using System.ComponentModel.DataAnnotations;

namespace Resenha.API.DTOs.Auth
{
    public class UpdateProfileRequestDTO
    {
        public bool? Goleiro { get; set; }

        [MaxLength(20)]
        public string? TimeCoracaoCodigo { get; set; }
    }
}
