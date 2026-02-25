using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Resenha.API.Entities
{
    // Guarda quem o capitão já derrotou no ciclo atual
    // O capitão NÃO pode desafiar jogadores desta lista
    // Quando o ciclo encerra (capitão perde), esses bloqueios são resetados
    [Table("ciclo_capitao_bloqueados")]
    public class CicloCapitaoBloqueado
    {
        [Key]
        [Column("id_bloqueio")]
        public ulong IdBloqueio { get; set; }

        [Column("id_ciclo")]
        public ulong IdCiclo { get; set; }

        // Jogador que foi derrotado pelo capitão neste ciclo
        [Column("id_usuario_bloqueado")]
        public ulong IdUsuarioBloqueado { get; set; }

        [Column("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    }
}
