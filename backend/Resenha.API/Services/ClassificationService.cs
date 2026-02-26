using Resenha.API.Data;
using Resenha.API.DTOs.Classification;
using Resenha.API.Entities;

namespace Resenha.API.Services
{
    public class ClassificationService
    {
        private readonly ResenhaDbContext _context;

        public ClassificationService(ResenhaDbContext context)
        {
            _context = context;
        }

        // Admin atribui jogadores aos dois times antes de finalizar a partida
        public void AssignTeams(ulong adminId, ulong matchId, AssignTeamsDTO dto)
        {
            var partida = _context.Partidas.FirstOrDefault(p => p.IdPartida == matchId);
            if (partida == null)
                throw new Exception("Partida não encontrada.");

            ValidarAdmin(adminId, partida.IdGrupo);

            if (partida.Status != "ABERTA" && partida.Status != "EM_ANDAMENTO")
                throw new Exception("Só é possível atribuir times em partidas ABERTAS ou EM_ANDAMENTO.");

            if (dto.Time1.Jogadores.Count == 0 || dto.Time2.Jogadores.Count == 0)
                throw new Exception("Cada time deve ter pelo menos 1 jogador.");

            // Verifica duplicatas entre os dois times
            var duplicatas = dto.Time1.Jogadores.Intersect(dto.Time2.Jogadores).ToList();
            if (duplicatas.Any())
                throw new Exception("Um jogador não pode estar nos dois times ao mesmo tempo.");

            // Valida que todos os jogadores são membros ativos do grupo
            var todosJogadores = dto.Time1.Jogadores.Concat(dto.Time2.Jogadores).ToList();
            foreach (var idUsuario in todosJogadores)
            {
                var ehMembro = _context.GrupoUsuarios
                    .Any(gu => gu.IdGrupo == partida.IdGrupo && gu.IdUsuario == idUsuario && gu.Ativo);
                if (!ehMembro)
                    throw new Exception($"Usuário {idUsuario} não é membro ativo deste grupo.");
            }

            // Remove atribuições anteriores (permite re-atribuir times)
            var timesExistentes = _context.TimesPartida
                .Where(t => t.IdPartida == matchId)
                .ToList();

            if (timesExistentes.Any())
            {
                var idsTimesExistentes = timesExistentes.Select(t => t.IdTime).ToList();
                var jogadoresExistentes = _context.JogadoresTimePartida
                    .Where(j => idsTimesExistentes.Contains(j.IdTime))
                    .ToList();
                _context.JogadoresTimePartida.RemoveRange(jogadoresExistentes);
                _context.TimesPartida.RemoveRange(timesExistentes);
                _context.SaveChanges();
            }

            // Cria Time 1
            var time1 = new TimePartida
            {
                IdPartida = matchId,
                NumeroTime = 1,
                IdCapitao = dto.Time1.IdCapitao
            };
            _context.TimesPartida.Add(time1);
            _context.SaveChanges();

            foreach (var idUsuario in dto.Time1.Jogadores)
            {
                _context.JogadoresTimePartida.Add(new JogadorTimePartida
                {
                    IdTime = time1.IdTime,
                    IdUsuario = idUsuario
                });
            }

            // Cria Time 2
            var time2 = new TimePartida
            {
                IdPartida = matchId,
                NumeroTime = 2,
                IdCapitao = dto.Time2.IdCapitao
            };
            _context.TimesPartida.Add(time2);
            _context.SaveChanges();

            foreach (var idUsuario in dto.Time2.Jogadores)
            {
                _context.JogadoresTimePartida.Add(new JogadorTimePartida
                {
                    IdTime = time2.IdTime,
                    IdUsuario = idUsuario
                });
            }

            partida.Status = "EM_ANDAMENTO";
            partida.AtualizadoEm = DateTime.UtcNow;
            _context.SaveChanges();
        }

        // Admin registra o resultado da partida e atualiza a classificação
        public ClassificationResponseDTO FinalizeMatch(ulong adminId, ulong matchId, FinalizeMatchDTO dto)
        {
            var partida = _context.Partidas.FirstOrDefault(p => p.IdPartida == matchId);
            if (partida == null)
                throw new Exception("Partida não encontrada.");

            ValidarAdmin(adminId, partida.IdGrupo);

            if (partida.Status != "EM_ANDAMENTO")
                throw new Exception("A partida precisa estar EM_ANDAMENTO (times atribuídos) para ser finalizada.");

            if (dto.GolsTime1 == dto.GolsTime2)
                throw new Exception("Empate não é permitido. O resultado deve ter um vencedor claro.");

            // Busca os times
            var times = _context.TimesPartida
                .Where(t => t.IdPartida == matchId)
                .ToList();

            var time1 = times.FirstOrDefault(t => t.NumeroTime == 1);
            var time2 = times.FirstOrDefault(t => t.NumeroTime == 2);

            if (time1 == null || time2 == null)
                throw new Exception("Times não encontrados. Use o endpoint de atribuição de times primeiro.");

            // Busca os jogadores de cada time
            var jogadoresTime1 = _context.JogadoresTimePartida
                .Where(j => j.IdTime == time1.IdTime)
                .Select(j => j.IdUsuario)
                .ToList();

            var jogadoresTime2 = _context.JogadoresTimePartida
                .Where(j => j.IdTime == time2.IdTime)
                .Select(j => j.IdUsuario)
                .ToList();

            var vencedorNumeroTime = dto.GolsTime1 > dto.GolsTime2 ? 1 : 2;
            var jogadoresVencedores = vencedorNumeroTime == 1 ? jogadoresTime1 : jogadoresTime2;
            var jogadoresPerdedores = vencedorNumeroTime == 1 ? jogadoresTime2 : jogadoresTime1;

            // Registra o resultado
            _context.ResultadosPartida.Add(new ResultadoPartida
            {
                IdPartida = matchId,
                GolsTime1 = dto.GolsTime1,
                GolsTime2 = dto.GolsTime2,
                VencedorNumeroTime = vencedorNumeroTime
            });

            // Registra estatísticas individuais
            foreach (var stat in dto.Estatisticas)
            {
                _context.EstatisticasPartida.Add(new EstatisticaPartida
                {
                    IdPartida = matchId,
                    IdUsuario = stat.IdUsuario,
                    Gols = stat.Gols,
                    Assistencias = stat.Assistencias
                });
            }

            _context.SaveChanges();

            // Atualiza classificação para cada jogador usando a temporada da própria partida
            foreach (var idUsuario in jogadoresVencedores)
                AtualizarClassificacao(partida.IdTemporada, partida.IdGrupo, idUsuario,
                    pontos: 4, vitoria: true, gols: GetGols(dto, idUsuario), assistencias: GetAssistencias(dto, idUsuario));

            foreach (var idUsuario in jogadoresPerdedores)
                AtualizarClassificacao(partida.IdTemporada, partida.IdGrupo, idUsuario,
                    pontos: 1, vitoria: false, gols: GetGols(dto, idUsuario), assistencias: GetAssistencias(dto, idUsuario));

            _context.SaveChanges();

            // Finaliza a partida
            partida.Status = "FINALIZADA";
            partida.AtualizadoEm = DateTime.UtcNow;
            _context.SaveChanges();

            return GetSeasonClassification(partida.IdGrupo);
        }

        // Classificação da temporada ativa
        public ClassificationResponseDTO GetSeasonClassification(ulong groupId)
        {
            var temporada = _context.Temporadas
                .FirstOrDefault(t => t.IdGrupo == groupId && t.Status == "ATIVA");

            if (temporada == null)
                throw new Exception("Não há temporada ativa neste grupo.");

            var ranking = _context.ClassificacoesTemporada
                .Where(c => c.IdTemporada == temporada.IdTemporada)
                .Join(_context.Usuarios,
                    c => c.IdUsuario,
                    u => u.IdUsuario,
                    (c, u) => new ClassificationEntryDTO
                    {
                        IdUsuario = u.IdUsuario,
                        Nome = u.Nome,
                        Pontos = c.Pontos,
                        Vitorias = c.Vitorias,
                        Derrotas = c.Derrotas,
                        Presencas = c.Presencas,
                        Gols = c.Gols,
                        Assistencias = c.Assistencias,
                        Mvps = c.Mvps,
                        BolasMurchas = c.BolasMurchas
                    })
                .OrderByDescending(e => e.Pontos)
                .ThenByDescending(e => e.Vitorias)
                .ThenByDescending(e => e.Gols)
                .ToList();

            for (int i = 0; i < ranking.Count; i++)
                ranking[i].Posicao = i + 1;

            return new ClassificationResponseDTO { Classificacao = ranking };
        }

        // Classificação histórica geral do grupo
        public ClassificationResponseDTO GetAllTimeClassification(ulong groupId)
        {
            var ranking = _context.ClassificacoesGeralGrupo
                .Where(c => c.IdGrupo == groupId)
                .Join(_context.Usuarios,
                    c => c.IdUsuario,
                    u => u.IdUsuario,
                    (c, u) => new ClassificationEntryDTO
                    {
                        IdUsuario = u.IdUsuario,
                        Nome = u.Nome,
                        Pontos = c.Pontos,
                        Vitorias = c.Vitorias,
                        Derrotas = c.Derrotas,
                        Presencas = c.Presencas,
                        Gols = c.Gols,
                        Assistencias = c.Assistencias,
                        Mvps = c.Mvps,
                        BolasMurchas = c.BolasMurchas
                    })
                .OrderByDescending(e => e.Pontos)
                .ThenByDescending(e => e.Vitorias)
                .ThenByDescending(e => e.Gols)
                .ToList();

            for (int i = 0; i < ranking.Count; i++)
                ranking[i].Posicao = i + 1;

            return new ClassificationResponseDTO { Classificacao = ranking };
        }

        // Estatísticas do usuário logado no grupo (temporada ativa + histórico)
        public (ClassificationEntryDTO? temporada, ClassificationEntryDTO? geral)
            GetMyStats(ulong userId, ulong groupId)
        {
            var temporada = GetSeasonClassification(groupId).Classificacao
                .FirstOrDefault(e => e.IdUsuario == userId);

            var geral = GetAllTimeClassification(groupId).Classificacao
                .FirstOrDefault(e => e.IdUsuario == userId);

            return (temporada, geral);
        }

        // ── Auxiliares ────────────────────────────────────────────────────────

        private void AtualizarClassificacao(ulong idTemporada, ulong idGrupo, ulong idUsuario,
            int pontos, bool vitoria, int gols, int assistencias)
        {
            // Upsert ClassificacaoTemporada
            var classTemp = _context.ClassificacoesTemporada
                .FirstOrDefault(c => c.IdTemporada == idTemporada && c.IdUsuario == idUsuario);

            if (classTemp == null)
            {
                classTemp = new ClassificacaoTemporada
                {
                    IdTemporada = idTemporada,
                    IdUsuario = idUsuario
                };
                _context.ClassificacoesTemporada.Add(classTemp);
            }

            classTemp.Pontos += pontos;
            classTemp.Presencas += 1;
            classTemp.Gols += gols;
            classTemp.Assistencias += assistencias;
            if (vitoria) classTemp.Vitorias += 1;
            else classTemp.Derrotas += 1;
            classTemp.AtualizadoEm = DateTime.UtcNow;

            // Upsert ClassificacaoGeralGrupo
            var classGeral = _context.ClassificacoesGeralGrupo
                .FirstOrDefault(c => c.IdGrupo == idGrupo && c.IdUsuario == idUsuario);

            if (classGeral == null)
            {
                classGeral = new ClassificacaoGeralGrupo
                {
                    IdGrupo = idGrupo,
                    IdUsuario = idUsuario
                };
                _context.ClassificacoesGeralGrupo.Add(classGeral);
            }

            classGeral.Pontos += pontos;
            classGeral.Presencas += 1;
            classGeral.Gols += gols;
            classGeral.Assistencias += assistencias;
            if (vitoria) classGeral.Vitorias += 1;
            else classGeral.Derrotas += 1;
            classGeral.AtualizadoEm = DateTime.UtcNow;
        }

        private int GetGols(FinalizeMatchDTO dto, ulong idUsuario)
            => dto.Estatisticas.FirstOrDefault(e => e.IdUsuario == idUsuario)?.Gols ?? 0;

        private int GetAssistencias(FinalizeMatchDTO dto, ulong idUsuario)
            => dto.Estatisticas.FirstOrDefault(e => e.IdUsuario == idUsuario)?.Assistencias ?? 0;

        private void ValidarAdmin(ulong userId, ulong groupId)
        {
            var membro = _context.GrupoUsuarios
                .FirstOrDefault(gu => gu.IdGrupo == groupId && gu.IdUsuario == userId && gu.Ativo);

            if (membro == null)
                throw new Exception("Você não é membro deste grupo.");

            if (membro.Perfil != "ADMIN")
                throw new Exception("Apenas administradores podem executar esta ação.");
        }
    }
}
