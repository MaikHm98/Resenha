namespace Resenha.API.DTOs.Vote
{
    public class VoteRoundDTO
    {
        public ulong IdVotacao { get; set; }
        public string Tipo { get; set; } = string.Empty;
        public int Rodada { get; set; }
        public string Status { get; set; } = string.Empty;
        public List<VoteTallyDTO> Candidatos { get; set; } = new();
        public ulong? IdVencedorProvisorio { get; set; }
        public string? NomeVencedorProvisorio { get; set; }
    }
}
