namespace Resenha.API.DTOs.Groups
{
    public class GroupResponseDTO
    {
        public ulong IdGrupo { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public int LimiteJogadores { get; set; }
        public string Perfil { get; set; } = string.Empty; // ADMIN ou JOGADOR
        public int TotalMembros { get; set; }
        public DateTime CriadoEm { get; set; }
        public int? DiaSemana { get; set; }
        public string? HorarioFixo { get; set; }
    }
}
