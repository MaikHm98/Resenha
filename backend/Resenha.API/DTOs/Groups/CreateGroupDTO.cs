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
    }
}
