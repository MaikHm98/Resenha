namespace Resenha.API.DTOs.Matches
{
    public class PresenceResponseDTO
    {
        public ulong IdPartida { get; set; }
        public string Status { get; set; } = string.Empty; // CONFIRMADO ou CANCELADO
        public int TotalConfirmados { get; set; }
        public int LimiteVagas { get; set; }
    }
}
