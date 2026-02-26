using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Resenha.API.Entities
{
    // Controla o "reinado" do capitão dentro de um grupo/temporada
    // Um ciclo é encerrado quando o capitão perde, e um novo começa
    [Table("ciclos_capitao")]
    public class CicloCapitao
    {
        [Key]
        [Column("id_ciclo")]
        public ulong IdCiclo { get; set; }

        [Column("id_grupo")]
        public ulong IdGrupo { get; set; }

        [Column("id_temporada")]
        public ulong IdTemporada { get; set; }

        // Usuário que é o capitão atual deste ciclo
        [Column("id_capitao_atual")]
        public ulong IdCapitaoAtual { get; set; }

        // Jogador que está desafiando o capitão no momento (null = sem desafio pendente)
        [Column("id_desafiante_atual")]
        public ulong? IdDesafianteAtual { get; set; }

        // ATIVO | ENCERRADO
        [Required]
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "ATIVO";

        [Column("iniciado_em")]
        public DateTime IniciadoEm { get; set; } = DateTime.UtcNow;

        [Column("encerrado_em")]
        public DateTime? EncerradoEm { get; set; }
    }
}
