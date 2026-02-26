namespace Resenha.API.DTOs.Captain
{
    public class CaptainStatusDTO
    {
        public ulong IdCiclo { get; set; }
        public ulong IdCapitao { get; set; }
        public string NomeCapitao { get; set; } = string.Empty;

        // Desafiante atual (null se não há desafio pendente)
        public ulong? IdDesafiante { get; set; }
        public string? NomeDesafiante { get; set; }

        // Jogadores bloqueados neste ciclo (já foram derrotados pelo capitão)
        public List<BlockedPlayerDTO> Bloqueados { get; set; } = new();

        public string Status { get; set; } = string.Empty;
        public DateTime IniciadoEm { get; set; }
    }

    public class BlockedPlayerDTO
    {
        public ulong IdUsuario { get; set; }
        public string Nome { get; set; } = string.Empty;
    }
}
