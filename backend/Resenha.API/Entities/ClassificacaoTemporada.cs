using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Resenha.API.Entities
{
    // Pontuação do jogador na temporada atual do grupo
    // Zera a cada nova temporada confirmada
    // Pontuação: Vitória=3 + Presença=1 (total 4), Derrota=0 + Presença=1 (total 1), Ausência=0
    [Table("classificacoes_temporada")]
    public class ClassificacaoTemporada
    {
        [Key]
        [Column("id_classificacao")]
        public ulong IdClassificacao { get; set; }

        [Column("id_temporada")]
        public ulong IdTemporada { get; set; }

        [Column("id_usuario")]
        public ulong IdUsuario { get; set; }

        [Column("pontos")]
        public int Pontos { get; set; } = 0;

        [Column("vitorias")]
        public int Vitorias { get; set; } = 0;

        [Column("derrotas")]
        public int Derrotas { get; set; } = 0;

        [Column("presencas")]
        public int Presencas { get; set; } = 0;

        [Column("gols")]
        public int Gols { get; set; } = 0;

        [Column("assistencias")]
        public int Assistencias { get; set; } = 0;

        [Column("mvps")]
        public int Mvps { get; set; } = 0;

        [Column("bolas_murchas")]
        public int BolasMurchas { get; set; } = 0;

        [Column("atualizado_em")]
        public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;
    }
}
