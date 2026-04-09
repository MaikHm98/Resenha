using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Resenha.API.Entities
{
    [Table("historico_capitao")]
    public class HistoricoCapitao
    {
        [Key]
        [Column("id_historico")]
        public ulong IdHistorico { get; set; }

        [Column("id_grupo")]
        public ulong IdGrupo { get; set; }

        [Column("id_partida")]
        public ulong IdPartida { get; set; }

        [Column("id_ciclo")]
        public ulong IdCiclo { get; set; }

        [Column("id_capitao")]
        public ulong IdCapitao { get; set; }

        [Column("id_desafiante")]
        public ulong IdDesafiante { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("resultado")]
        public string Resultado { get; set; } = string.Empty;

        [Column("id_vencedor")]
        public ulong IdVencedor { get; set; }

        [Column("id_derrotado")]
        public ulong IdDerrotado { get; set; }

        [Column("registrado_em")]
        public DateTime RegistradoEm { get; set; } = DateTime.UtcNow;
    }
}
