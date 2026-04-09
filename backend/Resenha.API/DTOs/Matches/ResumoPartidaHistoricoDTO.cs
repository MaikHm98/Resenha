namespace Resenha.API.DTOs.Matches
{
    public class ResumoPartidaHistoricoDTO
    {
        public ulong IdPartida { get; set; }
        public DateTime DataHoraJogo { get; set; }
        public string Status { get; set; } = string.Empty;
        public int LimiteVagas { get; set; }
        public int TotalConfirmados { get; set; }
        public int? GolsTime1 { get; set; }
        public int? GolsTime2 { get; set; }
        public string? NomeCapitaoTime1 { get; set; }
        public string? NomeCapitaoTime2 { get; set; }
        public int? NumeroTimeVencedor { get; set; }
        public string? NomeCapitaoVencedor { get; set; }
    }
}
