using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Resenha.API.Entities
{
    // Estatísticas individuais de cada jogador em uma partida
    [Table("estatisticas_partida")]
    public class EstatisticaPartida
    {
        [Key]
        [Column("id_estatistica")]
        public ulong IdEstatistica { get; set; }

        [Column("id_partida")]
        public ulong IdPartida { get; set; }

        [Column("id_usuario")]
        public ulong IdUsuario { get; set; }

        [Column("gols")]
        public int Gols { get; set; } = 0;

        [Column("assistencias")]
        public int Assistencias { get; set; } = 0;

        [Column("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

        [Column("atualizado_em")]
        public DateTime? AtualizadoEm { get; set; }
    }
}
