using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Resenha.API.Entities
{
    [Table("tokens_recuperacao_senha")]
    public class TokenRecuperacaoSenha
    {
        [Key]
        [Column("id_token")]
        public ulong IdToken { get; set; }

        [Column("id_usuario")]
        public ulong IdUsuario { get; set; }

        [Required]
        [MaxLength(128)]
        [Column("token_hash")]
        public string TokenHash { get; set; } = string.Empty;

        [Column("expira_em")]
        public DateTime ExpiraEm { get; set; }

        [Column("usado_em")]
        public DateTime? UsadoEm { get; set; }

        [MaxLength(64)]
        [Column("ip_solicitacao")]
        public string? IpSolicitacao { get; set; }

        [Column("tentativas_validacao")]
        public int TentativasValidacao { get; set; } = 0;

        [Column("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    }
}
