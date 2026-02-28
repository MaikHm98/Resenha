namespace Resenha.API.DTOs.Groups
{
    public class GroupMemberDTO
    {
        public ulong IdUsuario { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Perfil { get; set; } = "JOGADOR";
        public bool Goleiro { get; set; }
        public DateTime EntrouEm { get; set; }
    }
}
