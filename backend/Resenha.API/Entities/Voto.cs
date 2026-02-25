using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Resenha.API.Entities
{
    // Voto individual de um jogador em uma sessão de votação
    // Regras: não pode votar em si mesmo; cada jogador vota uma vez por votação
    [Table("votos")]
    public class Voto
    {
        [Key]
        [Column("id_voto")]
        public ulong IdVoto { get; set; }

        [Column("id_votacao")]
        public ulong IdVotacao { get; set; }

        // Quem está votando
        [Column("id_usuario_eleitor")]
        public ulong IdUsuarioEleitor { get; set; }

        // Em quem está votando
        [Column("id_usuario_votado")]
        public ulong IdUsuarioVotado { get; set; }

        [Column("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    }
}
