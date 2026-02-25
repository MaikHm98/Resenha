using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Resenha.API.Entities
{
    // Placar e vencedor da partida
    // Sempre há um vencedor (empate resolve-se nos pênaltis)
    [Table("resultados_partida")]
    public class ResultadoPartida
    {
        [Key]
        [Column("id_resultado")]
        public ulong IdResultado { get; set; }

        [Column("id_partida")]
        public ulong IdPartida { get; set; }

        [Column("gols_time_1")]
        public int GolsTime1 { get; set; } = 0;

        [Column("gols_time_2")]
        public int GolsTime2 { get; set; } = 0;

        // 1 ou 2 — indica qual time venceu
        [Column("vencedor_numero_time")]
        public int VencedorNumeroTime { get; set; }

        [Column("finalizado_em")]
        public DateTime FinalizadoEm { get; set; } = DateTime.UtcNow;
    }
}
