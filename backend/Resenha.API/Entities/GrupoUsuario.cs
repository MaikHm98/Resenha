using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Resenha.API.Entities
{
    // Tabela de relacionamento entre usuário e grupo
    // Perfil pode ser: ADMIN ou JOGADOR
    [Table("grupo_usuarios")]
    public class GrupoUsuario
    {
        [Key]
        [Column("id_grupo_usuario")]
        public ulong IdGrupoUsuario { get; set; }

        [Column("id_grupo")]
        public ulong IdGrupo { get; set; }

        [Column("id_usuario")]
        public ulong IdUsuario { get; set; }

        // ADMIN = pode criar partidas, convidar, gerenciar grupo
        // JOGADOR = apenas participa
        [Required]
        [MaxLength(20)]
        [Column("perfil")]
        public string Perfil { get; set; } = "JOGADOR";

        [Column("ativo")]
        public bool Ativo { get; set; } = true;

        [Column("entrou_em")]
        public DateTime EntrouEm { get; set; } = DateTime.UtcNow;
    }
}
