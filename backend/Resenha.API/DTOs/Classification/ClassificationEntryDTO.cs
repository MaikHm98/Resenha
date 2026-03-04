namespace Resenha.API.DTOs.Classification
{
    public class ClassificationEntryDTO
    {
        public int Posicao { get; set; }
        public ulong IdUsuario { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? TimeCoracaoCodigo { get; set; }
        public string? TimeCoracaoNome { get; set; }
        public string? TimeCoracaoEscudoUrl { get; set; }
        public int Pontos { get; set; }
        public int Vitorias { get; set; }
        public int Derrotas { get; set; }
        public int Presencas { get; set; }
        public int Gols { get; set; }
        public int Assistencias { get; set; }
        public int Mvps { get; set; }
        public int BolasMurchas { get; set; }
    }
}
