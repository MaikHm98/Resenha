namespace Resenha.API.DTOs.Groups
{
    public class GroupPendingInviteDTO
    {
        public ulong IdConvite { get; set; }
        public string EmailConvidado { get; set; } = string.Empty;
        public string CodigoConvite { get; set; } = string.Empty;
        public string InviteLink { get; set; } = string.Empty;
        public DateTime ExpiraEm { get; set; }
        public DateTime CriadoEm { get; set; }
    }
}
