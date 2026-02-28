namespace Resenha.API.DTOs.Vote
{
    public class VoteStatusDTO
    {
        public VoteRoundDTO? Mvp { get; set; }
        public VoteRoundDTO? BolaMurcha { get; set; }
        public List<VoteRoundDTO> MvpHistorico { get; set; } = new();
        public List<VoteRoundDTO> BolaMurchaHistorico { get; set; } = new();
    }
}
