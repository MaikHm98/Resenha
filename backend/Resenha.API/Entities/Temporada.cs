using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Resenha.API.Entities
{
    // Temporada anual por grupo — criada quando admin confirmar
    // Status: SUGERIDA (aguardando confirmação) | ATIVA | ENCERRADA
    [Table("temporadas")]
    public class Temporada
    {
        [Key]
        [Column("id_temporada")]
        public ulong IdTemporada { get; set; }

        [Column("id_grupo")]
        public ulong IdGrupo { get; set; }

        [Column("ano")]
        public int Ano { get; set; }

        // Ex: "Temporada 2026"
        [Required]
        [MaxLength(60)]
        [Column("nome")]
        public string Nome { get; set; } = string.Empty;

        // SUGERIDA | ATIVA | ENCERRADA
        [Required]
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "SUGERIDA";

        // Admin que confirmou a temporada
        [Column("confirmada_por_usuario")]
        public ulong? ConfirmadaPorUsuario { get; set; }

        [Column("confirmada_em")]
        public DateTime? ConfirmadaEm { get; set; }

        [Column("criada_em")]
        public DateTime CriadaEm { get; set; } = DateTime.UtcNow;
    }
}
