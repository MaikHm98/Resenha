namespace Resenha.API.DTOs.Vote
{
    public class VoteTallyDTO
    {
        public ulong IdUsuario { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int Votos { get; set; }
    }
}
