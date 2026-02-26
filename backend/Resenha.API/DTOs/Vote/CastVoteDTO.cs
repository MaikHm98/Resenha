using System.ComponentModel.DataAnnotations;

namespace Resenha.API.DTOs.Vote
{
    public class CastVoteDTO
    {
        // "MVP" ou "BOLA_MURCHA"
        [Required]
        public string Tipo { get; set; } = string.Empty;

        [Required]
        public ulong IdUsuarioVotado { get; set; }
    }
}
