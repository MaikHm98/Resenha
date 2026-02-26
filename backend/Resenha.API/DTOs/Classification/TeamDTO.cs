using System.ComponentModel.DataAnnotations;

namespace Resenha.API.DTOs.Classification
{
    public class TeamDTO
    {
        [Required]
        public ulong IdCapitao { get; set; }

        [Required]
        public List<ulong> Jogadores { get; set; } = new();
    }
}
