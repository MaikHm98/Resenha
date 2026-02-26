using System.ComponentModel.DataAnnotations;

namespace Resenha.API.DTOs.Matches
{
    public class CreateMatchDTO
    {
        [Required(ErrorMessage = "IdGrupo é obrigatório.")]
        public ulong IdGrupo { get; set; }

        [Required(ErrorMessage = "Data e hora do jogo são obrigatórias.")]
        public DateTime DataHoraJogo { get; set; }

        [Range(2, 100, ErrorMessage = "Limite de vagas deve ser entre 2 e 100.")]
        public int LimiteVagas { get; set; } = 16;

        [MaxLength(255)]
        public string? Observacao { get; set; }
    }
}
