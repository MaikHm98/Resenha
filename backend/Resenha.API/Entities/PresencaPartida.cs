using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Resenha.API.Entities
{
    // Controla quem confirmou presença na partida
    // Regra: bloqueia quando total_confirmados >= limite_jogadores do grupo
    [Table("presencas_partida")]
    public class PresencaPartida
    {
        [Key]
        [Column("id_presenca")]
        public ulong IdPresenca { get; set; }

        [Column("id_partida")]
        public ulong IdPartida { get; set; }

        [Column("id_usuario")]
        public ulong IdUsuario { get; set; }

        // CONFIRMADO | CANCELADO
        [Required]
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "CONFIRMADO";

        [Column("confirmado_em")]
        public DateTime ConfirmadoEm { get; set; } = DateTime.UtcNow;
    }
}
