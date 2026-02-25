using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Resenha.API.Entities
{
    // Relaciona cada jogador ao seu time em uma partida específica
    // Usado para calcular a pontuação corretamente (vitória/derrota por time)
    [Table("jogadores_time_partida")]
    public class JogadorTimePartida
    {
        [Key]
        [Column("id_jogador_time")]
        public ulong IdJogadorTime { get; set; }

        [Column("id_time")]
        public ulong IdTime { get; set; }

        [Column("id_usuario")]
        public ulong IdUsuario { get; set; }
    }
}
