using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Resenha.API.Entities
{
    // Representa um jogo (rachão) dentro de um grupo e temporada
    // Status: ABERTA | EM_ANDAMENTO | FINALIZADA | CANCELADA
    [Table("partidas")]
    public class Partida
    {
        [Key]
        [Column("id_partida")]
        public ulong IdPartida { get; set; }

        [Column("id_grupo")]
        public ulong IdGrupo { get; set; }

        [Column("id_temporada")]
        public ulong IdTemporada { get; set; }

        [Column("data_hora_jogo")]
        public DateTime DataHoraJogo { get; set; }

        // ABERTA | EM_ANDAMENTO | FINALIZADA | CANCELADA
        [Required]
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "ABERTA";

        [MaxLength(255)]
        [Column("observacao")]
        public string? Observacao { get; set; }

        [Column("criado_por_usuario")]
        public ulong CriadoPorUsuario { get; set; }

        // Vínculo com o ciclo de capitão ativo no momento da partida
        [Column("id_ciclo_capitao")]
        public ulong? IdCicloCapitao { get; set; }

        [Column("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

        [Column("atualizado_em")]
        public DateTime? AtualizadoEm { get; set; }
    }
}
