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

            var inicioDia = dto.DataHoraJogo.Date;
            var fimDia = inicioDia.AddDays(1);
            var jaExisteNoDia = _context.Partidas.Any(p =>
                p.IdGrupo == dto.IdGrupo &&
                p.Status != "CANCELADA" &&
                p.DataHoraJogo >= inicioDia &&
                p.DataHoraJogo < fimDia);

            if (jaExisteNoDia)
                throw new Exception("Ja existe uma partida cadastrada para este dia.");

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

        // Admin exclui uma partida e seus dados relacionados.
        public void DeleteMatch(ulong userId, ulong matchId)
        {
            using var transaction = _context.Database.BeginTransaction(IsolationLevel.Serializable);

            var partida = _context.Partidas.FirstOrDefault(p => p.IdPartida == matchId);
            if (partida == null)
                throw new Exception("Partida nao encontrada.");

            var membro = _context.GrupoUsuarios
                .FirstOrDefault(gu => gu.IdGrupo == partida.IdGrupo && gu.IdUsuario == userId && gu.Ativo);

            if (membro == null)
                throw new Exception("Voce nao e membro deste grupo.");

            if (membro.Perfil != "ADMIN")
                throw new Exception("Apenas administradores podem excluir partidas.");

            RevertClassificationForDeletedMatch(partida, matchId);

            var votacoesIds = _context.VotacoesPartida
                .Where(v => v.IdPartida == matchId)
                .Select(v => v.IdVotacao)
                .ToList();

            if (votacoesIds.Count > 0)
            {
                var votos = _context.Votos.Where(v => votacoesIds.Contains(v.IdVotacao)).ToList();
                if (votos.Count > 0)
                    _context.Votos.RemoveRange(votos);
            }

            var votacoes = _context.VotacoesPartida.Where(v => v.IdPartida == matchId).ToList();
            if (votacoes.Count > 0)
                _context.VotacoesPartida.RemoveRange(votacoes);

            var timesIds = _context.TimesPartida
                .Where(t => t.IdPartida == matchId)
                .Select(t => t.IdTime)
                .ToList();

            if (timesIds.Count > 0)
            {
                var jogadoresTime = _context.JogadoresTimePartida.Where(j => timesIds.Contains(j.IdTime)).ToList();
                if (jogadoresTime.Count > 0)
                    _context.JogadoresTimePartida.RemoveRange(jogadoresTime);
            }

            var times = _context.TimesPartida.Where(t => t.IdPartida == matchId).ToList();
            if (times.Count > 0)
                _context.TimesPartida.RemoveRange(times);

            var presencas = _context.PresencasPartida.Where(p => p.IdPartida == matchId).ToList();
            if (presencas.Count > 0)
                _context.PresencasPartida.RemoveRange(presencas);

            var resultados = _context.ResultadosPartida.Where(r => r.IdPartida == matchId).ToList();
            if (resultados.Count > 0)
                _context.ResultadosPartida.RemoveRange(resultados);

            var estatisticas = _context.EstatisticasPartida.Where(e => e.IdPartida == matchId).ToList();
            if (estatisticas.Count > 0)
                _context.EstatisticasPartida.RemoveRange(estatisticas);

            _context.Partidas.Remove(partida);
            _context.SaveChanges();
            transaction.Commit();
        }

        private void RevertClassificationForDeletedMatch(Partida partida, ulong matchId)
        {
            if (partida.Status != "FINALIZADA")
                return;

            var resultado = _context.ResultadosPartida.FirstOrDefault(r => r.IdPartida == matchId);
            if (resultado == null)
                return;

            var times = _context.TimesPartida
                .Where(t => t.IdPartida == matchId)
                .ToList();

            var timeVencedor = times.FirstOrDefault(t => t.NumeroTime == resultado.VencedorNumeroTime);
            if (timeVencedor == null)
                return;

            var timePerdedor = times.FirstOrDefault(t => t.IdTime != timeVencedor.IdTime);
            if (timePerdedor == null)
                return;

            var jogadoresTime = _context.JogadoresTimePartida
                .Where(j => j.IdTime == timeVencedor.IdTime || j.IdTime == timePerdedor.IdTime)
                .ToList();

            var vencedores = jogadoresTime
                .Where(j => j.IdTime == timeVencedor.IdTime)
                .Select(j => j.IdUsuario)
                .Distinct()
                .ToList();

            var perdedores = jogadoresTime
                .Where(j => j.IdTime == timePerdedor.IdTime)
                .Select(j => j.IdUsuario)
                .Distinct()
                .ToList();

            var estatisticas = _context.EstatisticasPartida
                .Where(e => e.IdPartida == matchId)
                .ToList()
                .ToDictionary(e => e.IdUsuario, e => (Gols: e.Gols, Assistencias: e.Assistencias));

            foreach (var idUsuario in vencedores)
            {
                var stat = estatisticas.TryGetValue(idUsuario, out var value) ? value : (0, 0);
                RollbackPlayerBaseStats(partida.IdTemporada, partida.IdGrupo, idUsuario, 4, vitoria: true, stat.Item1, stat.Item2);
            }

            foreach (var idUsuario in perdedores)
            {
                var stat = estatisticas.TryGetValue(idUsuario, out var value) ? value : (0, 0);
                RollbackPlayerBaseStats(partida.IdTemporada, partida.IdGrupo, idUsuario, 1, vitoria: false, stat.Item1, stat.Item2);
            }

            var votacoesAprovadas = _context.VotacoesPartida
                .Where(v => v.IdPartida == matchId && v.Status == "APROVADA" && v.IdUsuarioVencedorProvisorio.HasValue)
                .ToList();

            foreach (var votacao in votacoesAprovadas)
            {
                RollbackVoteAward(partida.IdTemporada, partida.IdGrupo, votacao.IdUsuarioVencedorProvisorio!.Value, votacao.Tipo);
            }

            _context.SaveChanges();
        }

        private void RollbackPlayerBaseStats(ulong idTemporada, ulong idGrupo, ulong idUsuario, int pontos, bool vitoria, int gols, int assistencias)
        {
            var classTemp = _context.ClassificacoesTemporada
                .FirstOrDefault(c => c.IdTemporada == idTemporada && c.IdUsuario == idUsuario);

            if (classTemp != null)
            {
                classTemp.Pontos = ClampNonNegative(classTemp.Pontos - pontos);
                classTemp.Presencas = ClampNonNegative(classTemp.Presencas - 1);
                classTemp.Gols = ClampNonNegative(classTemp.Gols - gols);
                classTemp.Assistencias = ClampNonNegative(classTemp.Assistencias - assistencias);
                classTemp.Vitorias = vitoria
                    ? ClampNonNegative(classTemp.Vitorias - 1)
                    : classTemp.Vitorias;
                classTemp.Derrotas = vitoria
                    ? classTemp.Derrotas
                    : ClampNonNegative(classTemp.Derrotas - 1);
                classTemp.AtualizadoEm = DateTime.UtcNow;
            }

            var classGeral = _context.ClassificacoesGeralGrupo
                .FirstOrDefault(c => c.IdGrupo == idGrupo && c.IdUsuario == idUsuario);

            if (classGeral != null)
            {
                classGeral.Pontos = ClampNonNegative(classGeral.Pontos - pontos);
                classGeral.Presencas = ClampNonNegative(classGeral.Presencas - 1);
                classGeral.Gols = ClampNonNegative(classGeral.Gols - gols);
                classGeral.Assistencias = ClampNonNegative(classGeral.Assistencias - assistencias);
                classGeral.Vitorias = vitoria
                    ? ClampNonNegative(classGeral.Vitorias - 1)
                    : classGeral.Vitorias;
                classGeral.Derrotas = vitoria
                    ? classGeral.Derrotas
                    : ClampNonNegative(classGeral.Derrotas - 1);
                classGeral.AtualizadoEm = DateTime.UtcNow;
            }
        }

        private void RollbackVoteAward(ulong idTemporada, ulong idGrupo, ulong idUsuario, string tipo)
        {
            var classTemp = _context.ClassificacoesTemporada
                .FirstOrDefault(c => c.IdTemporada == idTemporada && c.IdUsuario == idUsuario);

            if (classTemp != null)
            {
                if (tipo == "MVP")
                    classTemp.Mvps = ClampNonNegative(classTemp.Mvps - 1);
                else if (tipo == "BOLA_MURCHA")
                    classTemp.BolasMurchas = ClampNonNegative(classTemp.BolasMurchas - 1);
                classTemp.AtualizadoEm = DateTime.UtcNow;
            }

            var classGeral = _context.ClassificacoesGeralGrupo
                .FirstOrDefault(c => c.IdGrupo == idGrupo && c.IdUsuario == idUsuario);

            if (classGeral != null)
            {
                if (tipo == "MVP")
                    classGeral.Mvps = ClampNonNegative(classGeral.Mvps - 1);
                else if (tipo == "BOLA_MURCHA")
                    classGeral.BolasMurchas = ClampNonNegative(classGeral.BolasMurchas - 1);
                classGeral.AtualizadoEm = DateTime.UtcNow;
            }
        }

        private static int ClampNonNegative(int value) => value < 0 ? 0 : value;

        // Usuario confirma presenca na partida
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

