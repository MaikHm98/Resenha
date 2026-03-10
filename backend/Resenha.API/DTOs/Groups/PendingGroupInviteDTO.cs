namespace Resenha.API.DTOs.Groups
{
    public class PendingGroupInviteDTO
    {
        public ulong IdConvite { get; set; }
        public ulong IdGrupo { get; set; }
        public string NomeGrupo { get; set; } = string.Empty;
        public string CodigoConvite { get; set; } = string.Empty;
        public DateTime ExpiraEm { get; set; }
        public DateTime CriadoEm { get; set; }
    }
}
