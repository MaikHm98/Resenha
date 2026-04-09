using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Resenha.API.Entities
{
    [Table("desafios_partida")]
    public class DesafioPartida
    {
        [Key]
        [Column("id_desafio")]
        public ulong IdDesafio { get; set; }

        [Column("id_partida")]
        public ulong IdPartida { get; set; }

        [Required]
        [MaxLength(40)]
        [Column("status_fluxo")]
        public string StatusFluxo { get; set; } = "AGUARDANDO_CONFIRMACOES";

        [Column("id_capitao_atual")]
        public ulong? IdCapitaoAtual { get; set; }

        [Column("id_desafiante")]
        public ulong? IdDesafiante { get; set; }

        [MaxLength(10)]
        [Column("escolha_paridade_capitao_atual")]
        public string? EscolhaParidadeCapitaoAtual { get; set; }

        [Column("numero_capitao_atual")]
        public int? NumeroCapitaoAtual { get; set; }

        [Column("numero_desafiante")]
        public int? NumeroDesafiante { get; set; }

        [Column("soma_par_impar_linha")]
        public int? SomaParImparLinha { get; set; }

        [Column("id_vencedor_par_impar_linha")]
        public ulong? IdVencedorParImparLinha { get; set; }

        [Column("id_proximo_capitao_escolha")]
        public ulong? IdProximoCapitaoEscolha { get; set; }

        [MaxLength(10)]
        [Column("escolha_paridade_goleiro_capitao_atual")]
        public string? EscolhaParidadeGoleiroCapitaoAtual { get; set; }

        [Column("numero_goleiro_capitao_atual")]
        public int? NumeroGoleiroCapitaoAtual { get; set; }

        [Column("numero_goleiro_desafiante")]
        public int? NumeroGoleiroDesafiante { get; set; }

        [Column("soma_par_impar_goleiro")]
        public int? SomaParImparGoleiro { get; set; }

        [Column("id_vencedor_par_impar_goleiro")]
        public ulong? IdVencedorParImparGoleiro { get; set; }

        [Column("id_proximo_capitao_escolha_goleiro")]
        public ulong? IdProximoCapitaoEscolhaGoleiro { get; set; }

        [Column("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

        [Column("atualizado_em")]
        public DateTime? AtualizadoEm { get; set; }
    }
}
