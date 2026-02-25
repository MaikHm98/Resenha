using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Resenha.API.Entities
{
    // Representa um dos dois times de uma partida
    // numero_time: 1 ou 2
    [Table("times_partida")]
    public class TimePartida
    {
        [Key]
        [Column("id_time")]
        public ulong IdTime { get; set; }

        [Column("id_partida")]
        public ulong IdPartida { get; set; }

        // 1 ou 2
        [Column("numero_time")]
        public int NumeroTime { get; set; }

        // Capitão responsável por este time
        [Column("id_capitao")]
        public ulong IdCapitao { get; set; }
    }
}
