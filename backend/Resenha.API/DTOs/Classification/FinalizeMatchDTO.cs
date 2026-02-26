using System.ComponentModel.DataAnnotations;

namespace Resenha.API.DTOs.Classification
{
    public class FinalizeMatchDTO
    {
        [Required]
        [Range(0, 99)]
        public int GolsTime1 { get; set; }

        [Required]
        [Range(0, 99)]
        public int GolsTime2 { get; set; }

        // Estatísticas individuais opcionais (gols e assistências por jogador)
        public List<PlayerStatDTO> Estatisticas { get; set; } = new();
    }
}
