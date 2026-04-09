namespace Resenha.API.DTOs.Matches
{
    public class PremioPartidaDetalheDTO
    {
        public string Tipo { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int Rodada { get; set; }
        public ulong? IdVencedor { get; set; }
        public string? NomeVencedor { get; set; }
    }
}
