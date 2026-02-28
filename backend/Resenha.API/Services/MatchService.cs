using Microsoft.EntityFrameworkCore;
using Resenha.API.Data;
using Resenha.API.DTOs.Matches;
using Resenha.API.Entities;
using System.Data;

namespace Resenha.API.Services
{
    public class MatchService
    {
        private readonly ResenhaDbContext _context;

        public MatchService(ResenhaDbContext context)
        {
            _context = context;
        }

        // Admin cria uma partida no grupo. Se não houver temporada ATIVA, cria automaticamente.
        public MatchResponseDTO CreateMatch(ulong userId, CreateMatchDTO dto)
        {
            var grupo = _context.Grupos.FirstOrDefault(g => g.IdGrupo == dto.IdGrupo && g.Ativo);
            if (grupo == null)
                throw new Exception("Grupo não encontrado.");

            var membro = _context.GrupoUsuarios
                .FirstOrDefault(gu => gu.IdGrupo == dto.IdGrupo && gu.IdUsuario == userId && gu.Ativo);

            if (membro == null)
                throw new Exception("Você não é membro deste grupo.");

            if (membro.Perfil != "ADMIN")
                throw new Exception("Apenas administradores podem criar partidas.");

            // Vagas da partida não podem exceder o limite de membros do grupo
            if (dto.LimiteVagas > grupo.LimiteJogadores)
                throw new Exception($"Limite de vagas ({dto.LimiteVagas}) não pode exceder o limite de jogadores do grupo ({grupo.LimiteJogadores}).");

            // Busca temporada ATIVA do grupo; cria se não existir
            var temporada = _context.Temporadas
                .FirstOrDefault(t => t.IdGrupo == dto.IdGrupo && t.Status == "ATIVA");

            if (temporada == null)
            {
                temporada = new Temporada
                {
                    IdGrupo = dto.IdGrupo,
                    Ano = DateTime.UtcNow.Year,
                    Nome = $"Temporada {DateTime.UtcNow.Year}",
                    Status = "ATIVA",
                    ConfirmadaPorUsuario = userId,
                    ConfirmadaEm = DateTime.UtcNow
                };
                _context.Temporadas.Add(temporada);
                _context.SaveChanges();
            }

            var partida = new Partida
            {
                IdGrupo = dto.IdGrupo,
                IdTemporada = temporada.IdTemporada,
                DataHoraJogo = dto.DataHoraJogo,
                LimiteVagas = dto.LimiteVagas,
                Observacao = dto.Observacao,
                CriadoPorUsuario = userId
            };

            _context.Partidas.Add(partida);
            _context.SaveChanges();

            return MapToDTO(partida, 0, false, false, new(), new(), new());
        }

        // Lista todas as partidas de um grupo com status de presença do usuário
        public List<MatchResponseDTO> GetGroupMatches(ulong userId, ulong groupId)
        {
            var grupo = _context.Grupos.FirstOrDefault(g => g.IdGrupo == groupId && g.Ativo);
            if (grupo == null)
                throw new Exception("Grupo não encontrado.");

            var ehMembro = _context.GrupoUsuarios
                .Any(gu => gu.IdGrupo == groupId && gu.IdUsuario == userId && gu.Ativo);

            if (!ehMembro)
                throw new Exception("Você não é membro deste grupo.");

            var partidas = _context.Partidas
                .Where(p => p.IdGrupo == groupId)
                .OrderByDescending(p => p.DataHoraJogo)
                .ToList();

            return partidas.Select(p =>
            {
                var presencas = _context.PresencasPartida
                    .Where(pr => pr.IdPartida == p.IdPartida && (pr.Status == "CONFIRMADO" || pr.Status == "AUSENTE"))
                    .Join(_context.Usuarios, pr => pr.IdUsuario, u => u.IdUsuario,
                        (pr, u) => new { pr.Status, u.Nome, pr.IdUsuario, u.Goleiro })
                    .ToList();

                var confirmados   = presencas.Where(x => x.Status == "CONFIRMADO")
                    .Select(x => new ConfirmadoInfoDTO { Nome = x.Nome, Goleiro = x.Goleiro }).ToList();
                var ausentesNomes = presencas.Where(x => x.Status == "AUSENTE").Select(x => x.Nome).ToList();
                var total         = confirmados.Count;
                var confirmado    = presencas.Any(x => x.Status == "CONFIRMADO" && x.IdUsuario == userId);
                var ausente       = presencas.Any(x => x.Status == "AUSENTE"    && x.IdUsuario == userId);

                // Membros que não responderam (nem confirmaram nem marcaram ausência)
                var idsMembros = _context.GrupoUsuarios
                    .Where(gu => gu.IdGrupo == groupId && gu.Ativo)
                    .Select(gu => gu.IdUsuario).ToList();
                var idsResponderam = presencas.Select(x => x.IdUsuario).ToHashSet();
                var naoConfirmaramNomes = _context.Usuarios
                    .Where(u => idsMembros.Contains(u.IdUsuario) && !idsResponderam.Contains(u.IdUsuario))
                    .Select(u => u.Nome).ToList();

                // Para partidas finalizadas: buscar time vencedor e seu capitão
                string? nomeCapitaoVencedor = null;
                var jogadoresVencedores = new List<string>();

                if (p.Status == "FINALIZADA")
                {
                    var resultado = _context.ResultadosPartida
                        .FirstOrDefault(r => r.IdPartida == p.IdPartida);

                    if (resultado != null)
                    {
                        var timeVencedor = _context.TimesPartida
                            .FirstOrDefault(t => t.IdPartida == p.IdPartida && t.NumeroTime == resultado.VencedorNumeroTime);

                        if (timeVencedor != null)
                        {
                            nomeCapitaoVencedor = _context.Usuarios
                                .Where(u => u.IdUsuario == timeVencedor.IdCapitao)
                                .Select(u => u.Nome)
                                .FirstOrDefault();

                            jogadoresVencedores = _context.JogadoresTimePartida
                                .Where(j => j.IdTime == timeVencedor.IdTime)
                                .Join(_context.Usuarios, j => j.IdUsuario, u => u.IdUsuario, (j, u) => u.Nome)
                                .ToList();
                        }
                    }
                }

                return MapToDTO(p, total, confirmado, ausente, confirmados, ausentesNomes, naoConfirmaramNomes, nomeCapitaoVencedor, jogadoresVencedores);
            }).ToList();
        }

        // Usuário confirma presença na partida
        public PresenceResponseDTO ConfirmPresence(ulong userId, ulong matchId)
        {
            using var transaction = _context.Database.BeginTransaction(IsolationLevel.Serializable);

            var partida = _context.Partidas.FirstOrDefault(p => p.IdPartida == matchId);
            if (partida == null)
                throw new Exception("Partida não encontrada.");

            if (partida.Status != "ABERTA")
                throw new Exception("Esta partida não está aberta para confirmações.");

            var ehMembro = _context.GrupoUsuarios
                .Any(gu => gu.IdGrupo == partida.IdGrupo && gu.IdUsuario == userId && gu.Ativo);

            if (!ehMembro)
                throw new Exception("Você não é membro deste grupo.");

            var presencaExistente = _context.PresencasPartida
                .FirstOrDefault(pr => pr.IdPartida == matchId && pr.IdUsuario == userId);

            if (presencaExistente != null && presencaExistente.Status == "CONFIRMADO")
                throw new Exception("Você já confirmou presença nesta partida.");

            // Em transação serializável para evitar overbooking em chamadas concorrentes
            var totalConfirmados = _context.PresencasPartida
                .Count(pr => pr.IdPartida == matchId && pr.Status == "CONFIRMADO");

            if (totalConfirmados >= partida.LimiteVagas)
                throw new Exception($"Vagas encerradas. Limite de {partida.LimiteVagas} jogadores atingido.");

            if (presencaExistente != null)
            {
                presencaExistente.Status = "CONFIRMADO";
                presencaExistente.ConfirmadoEm = DateTime.UtcNow;
            }
            else
            {
                _context.PresencasPartida.Add(new PresencaPartida
                {
                    IdPartida = matchId,
                    IdUsuario = userId
                });
            }

            _context.SaveChanges();
            transaction.Commit();

            var novoTotal = _context.PresencasPartida
                .Count(pr => pr.IdPartida == matchId && pr.Status == "CONFIRMADO");

            return new PresenceResponseDTO
            {
                IdPartida = matchId,
                Status = "CONFIRMADO",
                TotalConfirmados = novoTotal,
                LimiteVagas = partida.LimiteVagas
            };
        }

        // Usuário marca ausência explícita na partida
        public PresenceResponseDTO MarkAbsent(ulong userId, ulong matchId)
        {
            var partida = _context.Partidas.FirstOrDefault(p => p.IdPartida == matchId);
            if (partida == null)
                throw new Exception("Partida não encontrada.");

            if (partida.Status != "ABERTA")
                throw new Exception("Esta partida não está aberta.");

            var ehMembro = _context.GrupoUsuarios
                .Any(gu => gu.IdGrupo == partida.IdGrupo && gu.IdUsuario == userId && gu.Ativo);
            if (!ehMembro)
                throw new Exception("Você não é membro deste grupo.");

            var presenca = _context.PresencasPartida
                .FirstOrDefault(pr => pr.IdPartida == matchId && pr.IdUsuario == userId);

            if (presenca != null)
            {
                presenca.Status = "AUSENTE";
                presenca.ConfirmadoEm = DateTime.UtcNow;
            }
            else
            {
                _context.PresencasPartida.Add(new PresencaPartida
                {
                    IdPartida = matchId,
                    IdUsuario = userId,
                    Status = "AUSENTE"
                });
            }
            _context.SaveChanges();

            var total = _context.PresencasPartida.Count(pr => pr.IdPartida == matchId && pr.Status == "CONFIRMADO");
            return new PresenceResponseDTO { IdPartida = matchId, Status = "AUSENTE", TotalConfirmados = total, LimiteVagas = partida.LimiteVagas };
        }

        // Usuário cancela ausência (volta ao neutro)
        public PresenceResponseDTO CancelAbsent(ulong userId, ulong matchId)
        {
            var partida = _context.Partidas.FirstOrDefault(p => p.IdPartida == matchId);
            if (partida == null)
                throw new Exception("Partida não encontrada.");

            var presenca = _context.PresencasPartida
                .FirstOrDefault(pr => pr.IdPartida == matchId && pr.IdUsuario == userId && pr.Status == "AUSENTE");

            if (presenca == null)
                throw new Exception("Você não está marcado como ausente nesta partida.");

            presenca.Status = "CANCELADO";
            _context.SaveChanges();

            var total = _context.PresencasPartida.Count(pr => pr.IdPartida == matchId && pr.Status == "CONFIRMADO");
            return new PresenceResponseDTO { IdPartida = matchId, Status = "CANCELADO", TotalConfirmados = total, LimiteVagas = partida.LimiteVagas };
        }

        // Usuário cancela presença na partida
        public PresenceResponseDTO CancelPresence(ulong userId, ulong matchId)
        {
            var partida = _context.Partidas.FirstOrDefault(p => p.IdPartida == matchId);
            if (partida == null)
                throw new Exception("Partida não encontrada.");

            if (partida.Status != "ABERTA")
                throw new Exception("Não é possível cancelar presença em partida que não está aberta.");

            var presenca = _context.PresencasPartida
                .FirstOrDefault(pr => pr.IdPartida == matchId && pr.IdUsuario == userId && pr.Status == "CONFIRMADO");

            if (presenca == null)
                throw new Exception("Você não possui presença confirmada nesta partida.");

            presenca.Status = "CANCELADO";
            _context.SaveChanges();

            var total = _context.PresencasPartida
                .Count(pr => pr.IdPartida == matchId && pr.Status == "CONFIRMADO");

            return new PresenceResponseDTO
            {
                IdPartida = matchId,
                Status = "CANCELADO",
                TotalConfirmados = total,
                LimiteVagas = partida.LimiteVagas
            };
        }

        private MatchResponseDTO MapToDTO(Partida p, int total, bool confirmado, bool ausente = false,
            List<ConfirmadoInfoDTO>? confirmados = null, List<string>? ausentesNomes = null,
            List<string>? naoConfirmaramNomes = null,
            string? nomeCapitaoVencedor = null, List<string>? jogadoresVencedores = null)
        {
            return new MatchResponseDTO
            {
                IdPartida = p.IdPartida,
                IdGrupo = p.IdGrupo,
                IdTemporada = p.IdTemporada,
                DataHoraJogo = p.DataHoraJogo,
                Status = p.Status,
                Observacao = p.Observacao,
                TotalConfirmados = total,
                LimiteVagas = p.LimiteVagas,
                LimiteCheio = total >= p.LimiteVagas,
                UsuarioConfirmado = confirmado,
                UsuarioAusente = ausente,
                Confirmados = confirmados ?? new(),
                AusentesNomes = ausentesNomes ?? new(),
                NaoConfirmaramNomes = naoConfirmaramNomes ?? new(),
                NomeCapitaoVencedor = nomeCapitaoVencedor,
                JogadoresVencedores = jogadoresVencedores ?? new(),
                CriadoEm = p.CriadoEm
            };
        }
    }
}
