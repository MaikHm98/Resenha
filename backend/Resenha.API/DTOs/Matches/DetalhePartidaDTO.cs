namespace Resenha.API.DTOs.Matches
{
    public class DetalhePartidaDTO
    {
        public ulong IdPartida { get; set; }
        public ulong IdGrupo { get; set; }
        public DateTime DataHoraJogo { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Observacao { get; set; }
        public int LimiteVagas { get; set; }
        public int TotalConfirmados { get; set; }
        public int TotalAusentes { get; set; }
        public int? GolsTime1 { get; set; }
        public int? GolsTime2 { get; set; }
        public int? NumeroTimeVencedor { get; set; }
        public string? NomeCapitaoVencedor { get; set; }
        public TimePartidaDetalheDTO? Time1 { get; set; }
        public TimePartidaDetalheDTO? Time2 { get; set; }
        public List<string> ConfirmadosNomes { get; set; } = new();
        public List<string> AusentesNomes { get; set; } = new();
        public List<string> NaoConfirmaramNomes { get; set; } = new();
        public List<PremioPartidaDetalheDTO> Premios { get; set; } = new();
    }
}
