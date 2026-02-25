using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Resenha.API.Entities
{
    // Histórico acumulado do jogador no grupo — NUNCA zera
    // Soma todas as temporadas desde a criação do grupo
    [Table("classificacoes_geral_grupo")]
    public class ClassificacaoGeralGrupo
    {
        [Key]
        [Column("id_classificacao_geral")]
        public ulong IdClassificacaoGeral { get; set; }

        [Column("id_grupo")]
        public ulong IdGrupo { get; set; }

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
