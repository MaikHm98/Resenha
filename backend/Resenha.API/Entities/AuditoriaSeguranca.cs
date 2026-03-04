using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Resenha.API.Entities
{
    [Table("auditorias_seguranca")]
    public class AuditoriaSeguranca
    {
        [Key]
        [Column("id_auditoria")]
        public ulong IdAuditoria { get; set; }

        [MaxLength(80)]
        [Column("acao")]
        public string Acao { get; set; } = string.Empty;

        [Column("id_usuario")]
        public ulong? IdUsuario { get; set; }

        [MaxLength(180)]
        [Column("email_referencia")]
        public string? EmailReferencia { get; set; }

        [MaxLength(64)]
        [Column("ip_origem")]
        public string? IpOrigem { get; set; }

        [MaxLength(120)]
        [Column("detalhes")]
        public string? Detalhes { get; set; }

        [Column("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    }
}
