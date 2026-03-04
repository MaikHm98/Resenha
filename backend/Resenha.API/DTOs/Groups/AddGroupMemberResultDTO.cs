namespace Resenha.API.DTOs.Groups
{
    public class AddGroupMemberResultDTO
    {
        // ADDED | INVITED
        public string Acao { get; set; } = "ADDED";
        public string Mensagem { get; set; } = string.Empty;
        public GroupMemberDTO? Membro { get; set; }
        public string? CodigoConvite { get; set; }
        public string? InviteLink { get; set; }
        public DateTime? ExpiraEm { get; set; }
    }
}
