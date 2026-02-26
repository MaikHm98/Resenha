using System.ComponentModel.DataAnnotations;

namespace Resenha.API.DTOs.Vote
{
    public class CloseVoteDTO
    {
        // "MVP" ou "BOLA_MURCHA"
        [Required]
        public string Tipo { get; set; } = string.Empty;
    }
}
