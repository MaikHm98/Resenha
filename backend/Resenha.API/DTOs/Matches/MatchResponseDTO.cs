namespace Resenha.API.DTOs.Matches
{
    public class MatchResponseDTO
    {
        public ulong IdPartida { get; set; }
        public ulong IdGrupo { get; set; }
        public ulong IdTemporada { get; set; }
        public DateTime DataHoraJogo { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Observacao { get; set; }
        public int TotalConfirmados { get; set; }
        public int LimiteVagas { get; set; }
        public bool LimiteCheio { get; set; }
        public bool UsuarioConfirmado { get; set; }
        public bool UsuarioAusente { get; set; }
        public List<ConfirmadoInfoDTO> Confirmados { get; set; } = new();
        public List<string> AusentesNomes { get; set; } = new();
        public List<string> NaoConfirmaramNomes { get; set; } = new();
        public string? NomeCapitaoVencedor { get; set; }
        public List<string> JogadoresVencedores { get; set; } = new();
        public DateTime CriadoEm { get; set; }
    }
}
