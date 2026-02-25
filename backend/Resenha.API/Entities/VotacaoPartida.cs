using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Resenha.API.Entities
{
    // Sessão de votação para MVP ou Bola Murcha de uma partida
    // Rodada 1 = votação inicial; Rodada 2+ = desempate entre empatados
    // Status: ABERTA | APURADA | APROVADA | REJEITADA | CANCELADA
    [Table("votacoes_partida")]
    public class VotacaoPartida
    {
        [Key]
        [Column("id_votacao")]
        public ulong IdVotacao { get; set; }

        [Column("id_partida")]
        public ulong IdPartida { get; set; }

        // MVP ou BOLA_MURCHA
        [Required]
        [MaxLength(20)]
        [Column("tipo")]
        public string Tipo { get; set; } = string.Empty;

        // 1 = primeira votação; 2+ = rodada de desempate
        [Column("rodada")]
        public int Rodada { get; set; } = 1;

        // ABERTA | APURADA | APROVADA | REJEITADA | CANCELADA
        [Required]
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "ABERTA";

        // Vencedor provisório (aguardando aprovação do admin)
        [Column("id_usuario_vencedor_provisorio")]
        public ulong? IdUsuarioVencedorProvisorio { get; set; }

        [Column("apurada_em")]
        public DateTime? ApuradaEm { get; set; }

        // Admin que aprovou o resultado
        [Column("aprovada_por_usuario")]
        public ulong? AprovadaPorUsuario { get; set; }

        [Column("aprovada_em")]
        public DateTime? AprovadaEm { get; set; }

        [Column("observacao")]
        public string? Observacao { get; set; }

        [Column("criada_em")]
        public DateTime CriadaEm { get; set; } = DateTime.UtcNow;
    }
}
