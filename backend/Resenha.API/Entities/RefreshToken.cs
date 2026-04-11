using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Resenha.API.Entities
{
    [Table("refresh_tokens")]
    public class RefreshToken
    {
        [Key]
        [Column("id_refresh_token")]
        public ulong IdRefreshToken { get; set; }

        [Column("id_usuario")]
        public ulong IdUsuario { get; set; }

        [Required]
        [MaxLength(128)]
        [Column("token_hash")]
        public string TokenHash { get; set; } = string.Empty;

        [Column("expira_em")]
        public DateTime ExpiraEm { get; set; }

        [Column("revogado_em")]
        public DateTime? RevogadoEm { get; set; }

        [MaxLength(80)]
        [Column("criado_por_ip")]
        public string? CriadoPorIp { get; set; }

        [MaxLength(80)]
        [Column("revogado_por_ip")]
        public string? RevogadoPorIp { get; set; }

        [Column("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    }
}
