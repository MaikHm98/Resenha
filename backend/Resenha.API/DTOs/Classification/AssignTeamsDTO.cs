using System.ComponentModel.DataAnnotations;

namespace Resenha.API.DTOs.Classification
{
    public class AssignTeamsDTO
    {
        [Required]
        public TeamDTO Time1 { get; set; } = null!;

        [Required]
        public TeamDTO Time2 { get; set; } = null!;
    }
}
