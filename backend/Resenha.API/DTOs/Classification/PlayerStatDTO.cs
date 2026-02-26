namespace Resenha.API.DTOs.Classification
{
    public class PlayerStatDTO
    {
        public ulong IdUsuario { get; set; }
        public int Gols { get; set; } = 0;
        public int Assistencias { get; set; } = 0;
    }
}
