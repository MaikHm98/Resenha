using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Resenha.API.Entities
{
    [Table("configuracoes_grupo")]
    public class ConfiguracaoGrupo
    {
        [Key]
        [Column("id_configuracao_grupo")]
        public ulong IdConfiguracaoGrupo { get; set; }

        [Column("id_grupo")]
        public ulong IdGrupo { get; set; }

        [Required]
        [MaxLength(30)]
        [Column("tipo_jogo")]
        public string TipoJogo { get; set; } = "FUTEBOL";

        [Required]
        [MaxLength(30)]
        [Column("formato_jogo")]
        public string FormatoJogo { get; set; } = "DOIS_TIMES";

        [Column("quantidade_times")]
        public int QuantidadeTimes { get; set; } = 2;

        [Column("pontos_vitoria")]
        public int PontosVitoria { get; set; } = 4;

        [Column("pontos_derrota")]
        public int PontosDerrota { get; set; } = 1;

        [Column("pontos_empate")]
        public int PontosEmpate { get; set; } = 0;

        [Column("pontos_presenca")]
        public int PontosPresenca { get; set; } = 0;

        [Column("maximo_goleiros_por_partida")]
        public int MaximoGoleirosPorPartida { get; set; } = 2;

        [Column("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

        [Column("atualizado_em")]
        public DateTime? AtualizadoEm { get; set; }
    }
}
