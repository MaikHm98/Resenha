using System.ComponentModel.DataAnnotations;

namespace Resenha.API.DTOs.Groups
{
    public class CreateGroupDTO
    {
        [Required(ErrorMessage = "Nome é obrigatório.")]
        [MaxLength(120)]
        public string Nome { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Descricao { get; set; }

        [Range(2, 100, ErrorMessage = "Limite de jogadores deve ser entre 2 e 100.")]
        public int LimiteJogadores { get; set; } = 16;

        [Range(0, 6, ErrorMessage = "Dia da semana deve ser entre 0 (Dom) e 6 (Sab).")]
        public int? DiaSemana { get; set; }

        [MaxLength(5)]
        public string? HorarioFixo { get; set; }
    }
}
