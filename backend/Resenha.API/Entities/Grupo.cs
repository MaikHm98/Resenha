using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Resenha.API.Entities
{
    // Representa a tabela 'grupos' — apenas admins criam grupos
    [Table("grupos")]
    public class Grupo
    {
        [Key]
        [Column("id_grupo")]
        public ulong IdGrupo { get; set; }

        [Required]
        [MaxLength(120)]
        [Column("nome")]
        public string Nome { get; set; } = string.Empty;

        [MaxLength(255)]
        [Column("descricao")]
        public string? Descricao { get; set; }

        // Limite máximo de jogadores por partida
        [Column("limite_jogadores")]
        public int LimiteJogadores { get; set; } = 16;

        [Column("criado_por_usuario")]
        public ulong CriadoPorUsuario { get; set; }

        [Column("ativo")]
        public bool Ativo { get; set; } = true;

        // Dia da semana fixo do jogo: 0=Dom, 1=Seg, ..., 6=Sab (null = não definido)
        [Column("dia_semana")]
        public int? DiaSemana { get; set; }

        // Horário fixo do jogo no formato "HH:mm" (null = não definido)
        [MaxLength(5)]
        [Column("horario_fixo")]
        public string? HorarioFixo { get; set; }

        [Column("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

        [Column("atualizado_em")]
        public DateTime? AtualizadoEm { get; set; }
    }
}
