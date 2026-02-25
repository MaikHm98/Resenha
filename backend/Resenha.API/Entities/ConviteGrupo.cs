using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Resenha.API.Entities
{
    // Controla a entrada de jogadores via convite
    // Apenas ADMIN pode gerar convite
    [Table("convites_grupo")]
    public class ConviteGrupo
    {
        [Key]
        [Column("id_convite")]
        public ulong IdConvite { get; set; }

        [Column("id_grupo")]
        public ulong IdGrupo { get; set; }

        [Required]
        [MaxLength(180)]
        [Column("email_convidado")]
        public string EmailConvidado { get; set; } = string.Empty;

        // Código único enviado ao jogador (ex: "AB3X9F2K")
        [Required]
        [MaxLength(64)]
        [Column("codigo_convite")]
        public string CodigoConvite { get; set; } = string.Empty;

        // PENDENTE | ACEITO | EXPIRADO | CANCELADO
        [Required]
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "PENDENTE";

        [Column("criado_por_usuario")]
        public ulong CriadoPorUsuario { get; set; }

        [Column("expira_em")]
        public DateTime ExpiraEm { get; set; }

        [Column("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    }
}
