namespace Resenha.API.DTOs.Matches
{
    public class JogadorPartidaDetalheDTO
    {
        public ulong IdUsuario { get; set; }
        public string Nome { get; set; } = string.Empty;
        public bool Goleiro { get; set; }
        public int Gols { get; set; }
        public int Assistencias { get; set; }
    }
}
