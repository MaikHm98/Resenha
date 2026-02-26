using System.ComponentModel.DataAnnotations;

namespace Resenha.API.DTOs.Captain
{
    public class ChallengeResultDTO
    {
        // "CAPITAO" = capitão venceu | "DESAFIANTE" = desafiante venceu
        [Required(ErrorMessage = "Resultado é obrigatório.")]
        public string Resultado { get; set; } = string.Empty;
    }
}
