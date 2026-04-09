using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Resenha.API.Entities
{
    // Representa a tabela 'usuarios' no banco de dados
    [Table("usuarios")]
    public class Usuario
    {
        [Key]
        [Column("id_usuario")]
        public ulong IdUsuario { get; set; }

        [Required]
        [MaxLength(120)]
        [Column("nome")]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [MaxLength(180)]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Column("senha_hash")]
        public string SenhaHash { get; set; } = string.Empty;

        [Column("ativo")]
        public bool Ativo { get; set; } = true;

        [Column("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

        [Column("goleiro")]
        public bool Goleiro { get; set; } = false;

        [Column("convidado")]
        public bool Convidado { get; set; } = false;

        [MaxLength(20)]
        [Column("time_coracao_codigo")]
        public string? TimeCoracaoCodigo { get; set; }

        [MaxLength(20)]
        [Column("posicao_principal")]
        public string? PosicaoPrincipal { get; set; }

        [MaxLength(20)]
        [Column("pe_dominante")]
        public string? PeDominante { get; set; }

        [Column("atualizado_em")]
        public DateTime? AtualizadoEm { get; set; }
    }
}
