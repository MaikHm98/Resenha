namespace Resenha.API.DTOs.Groups
{
    public class InviteResponseDTO
    {
        public string CodigoConvite { get; set; } = string.Empty;
        public string EmailConvidado { get; set; } = string.Empty;
        public DateTime ExpiraEm { get; set; }
    }
}
