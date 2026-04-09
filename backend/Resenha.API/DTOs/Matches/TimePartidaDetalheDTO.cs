namespace Resenha.API.DTOs.Matches
{
    public class TimePartidaDetalheDTO
    {
        public int NumeroTime { get; set; }
        public ulong IdCapitao { get; set; }
        public string NomeCapitao { get; set; } = string.Empty;
        public List<JogadorPartidaDetalheDTO> Jogadores { get; set; } = new();
    }
}
