using Resenha.API.Data;
using Resenha.API.DTOs.Vote;
using Resenha.API.Entities;

namespace Resenha.API.Services
{
    public class VoteService
    {
        private readonly ResenhaDbContext _context;

        public VoteService(ResenhaDbContext context)
        {
            _context = context;
        }

        // Admin abre a votação para MVP e Bola Murcha após a partida ser finalizada
        public VoteStatusDTO OpenVoting(ulong adminId, ulong matchId)
        {
            var partida = _context.Partidas.FirstOrDefault(p => p.IdPartida == matchId);
            if (partida == null)
                throw new Exception("Partida não encontrada.");

            ValidarAdmin(adminId, partida.IdGrupo);

            if (partida.Status != "FINALIZADA")
                throw new Exception("Só é possível abrir votação em partidas FINALIZADAS.");

            // Verifica se já há votação em andamento
            var votacaoAtiva = _context.VotacoesPartida
                .Any(v => v.IdPartida == matchId && (v.Status == "ABERTA" || v.Status == "APURADA"));

            if (votacaoAtiva)
                throw new Exception("Já existe votação em andamento para esta partida. Encerre as votações abertas antes de reabrir.");

            _context.VotacoesPartida.Add(new VotacaoPartida
            {
                IdPartida = matchId,
                Tipo = "MVP",
                Rodada = 1,
                Status = "ABERTA"
            });

            _context.VotacoesPartida.Add(new VotacaoPartida
            {
                IdPartida = matchId,
                Tipo = "BOLA_MURCHA",
                Rodada = 1,
                Status = "ABERTA"
            });

            _context.SaveChanges();

            return GetVoteStatus(matchId);
        }

        // Jogador registra seu voto em uma votação aberta
        public VoteStatusDTO CastVote(ulong userId, ulong matchId, CastVoteDTO dto)
        {
            if (dto.Tipo != "MVP" && dto.Tipo != "BOLA_MURCHA")
                throw new Exception("Tipo inválido. Use 'MVP' ou 'BOLA_MURCHA'.");

            var partida = _context.Partidas.FirstOrDefault(p => p.IdPartida == matchId);
            if (partida == null)
                throw new Exception("Partida não encontrada.");

            if (partida.Status != "FINALIZADA")
                throw new Exception("Votação disponível apenas para partidas finalizadas.");

            // Busca a votação ABERTA mais recente para o tipo
            var votacao = _context.VotacoesPartida
                .Where(v => v.IdPartida == matchId && v.Tipo == dto.Tipo && v.Status == "ABERTA")
                .OrderByDescending(v => v.Rodada)
                .FirstOrDefault();

            if (votacao == null)
                throw new Exception($"Não há votação aberta para {dto.Tipo} nesta partida.");

            // Valida que o eleitor confirmou presença na partida
            var ehParticipante = _context.PresencasPartida
                .Any(p => p.IdPartida == matchId && p.IdUsuario == userId && p.Status == "CONFIRMADO");

            if (!ehParticipante)
                throw new Exception("Apenas jogadores que confirmaram presença podem votar.");

            // Valida que não está votando em si mesmo
            if (dto.IdUsuarioVotado == userId)
                throw new Exception("Você não pode votar em si mesmo.");

            // Valida que ainda não votou nesta rodada
            var jaVotou = _context.Votos
                .Any(v => v.IdVotacao == votacao.IdVotacao && v.IdUsuarioEleitor == userId);

            if (jaVotou)
                throw new Exception("Você já votou nesta rodada.");

            // Se for rodada de desempate, valida que o candidato está na lista restrita
            if (votacao.Rodada > 1 && !string.IsNullOrEmpty(votacao.Observacao))
            {
                var candidatosPermitidos = votacao.Observacao
                    .Split(',')
                    .Select(id => ulong.Parse(id.Trim()))
                    .ToList();

                if (!candidatosPermitidos.Contains(dto.IdUsuarioVotado))
                    throw new Exception("O jogador votado não está entre os candidatos desta rodada de desempate.");
            }
            else if (votacao.Rodada == 1)
            {
                // Na rodada 1, o votado deve ter confirmado presença na partida
                var votadoParticipou = _context.PresencasPartida
                    .Any(p => p.IdPartida == matchId && p.IdUsuario == dto.IdUsuarioVotado && p.Status == "CONFIRMADO");

                if (!votadoParticipou)
                    throw new Exception("O jogador votado não confirmou presença nesta partida.");
            }

            _context.Votos.Add(new Voto
            {
                IdVotacao = votacao.IdVotacao,
                IdUsuarioEleitor = userId,
                IdUsuarioVotado = dto.IdUsuarioVotado
            });

            _context.SaveChanges();

            return GetVoteStatus(matchId);
        }

        // Admin encerra a votação e apura o resultado
        public VoteStatusDTO CloseVoting(ulong adminId, ulong matchId, CloseVoteDTO dto)
        {
            if (dto.Tipo != "MVP" && dto.Tipo != "BOLA_MURCHA")
                throw new Exception("Tipo inválido. Use 'MVP' ou 'BOLA_MURCHA'.");

            var partida = _context.Partidas.FirstOrDefault(p => p.IdPartida == matchId);
            if (partida == null)
                throw new Exception("Partida não encontrada.");

            ValidarAdmin(adminId, partida.IdGrupo);

            var votacao = _context.VotacoesPartida
                .Where(v => v.IdPartida == matchId && v.Tipo == dto.Tipo && v.Status == "ABERTA")
                .OrderByDescending(v => v.Rodada)
                .FirstOrDefault();

            if (votacao == null)
                throw new Exception($"Não há votação aberta para {dto.Tipo} nesta partida.");

            // Conta os votos por candidato
            var contagem = _context.Votos
                .Where(v => v.IdVotacao == votacao.IdVotacao)
                .GroupBy(v => v.IdUsuarioVotado)
                .Select(g => new { IdUsuario = g.Key, Total = g.Count() })
                .OrderByDescending(g => g.Total)
                .ToList();

            if (contagem.Count == 0)
                throw new Exception("Nenhum voto registrado. Aguarde os jogadores votarem antes de encerrar.");

            var maxVotos = contagem.First().Total;
            var empatados = contagem.Where(c => c.Total == maxVotos).ToList();

            if (empatados.Count == 1)
            {
                // Vencedor único
                votacao.IdUsuarioVencedorProvisorio = empatados[0].IdUsuario;
                votacao.Status = "APURADA";
                votacao.ApuradaEm = DateTime.UtcNow;
            }
            else
            {
                // Empate: encerra rodada atual e abre nova com os empatados
                votacao.Status = "ENCERRADA";
                votacao.ApuradaEm = DateTime.UtcNow;

                var idsCandidatos = string.Join(",", empatados.Select(e => e.IdUsuario));

                _context.VotacoesPartida.Add(new VotacaoPartida
                {
                    IdPartida = matchId,
                    Tipo = dto.Tipo,
                    Rodada = votacao.Rodada + 1,
                    Status = "ABERTA",
                    Observacao = idsCandidatos
                });
            }

            _context.SaveChanges();

            return GetVoteStatus(matchId);
        }

        // Admin aprova o resultado provisório e atualiza a classificação
        public VoteStatusDTO ApproveVoting(ulong adminId, ulong matchId, ApproveVoteDTO dto)
        {
            if (dto.Tipo != "MVP" && dto.Tipo != "BOLA_MURCHA")
                throw new Exception("Tipo inválido. Use 'MVP' ou 'BOLA_MURCHA'.");

            var partida = _context.Partidas.FirstOrDefault(p => p.IdPartida == matchId);
            if (partida == null)
                throw new Exception("Partida não encontrada.");

            ValidarAdmin(adminId, partida.IdGrupo);

            var votacao = _context.VotacoesPartida
                .Where(v => v.IdPartida == matchId && v.Tipo == dto.Tipo && v.Status == "APURADA")
                .OrderByDescending(v => v.Rodada)
                .FirstOrDefault();

            if (votacao == null)
                throw new Exception($"Não há resultado apurado aguardando aprovação para {dto.Tipo}.");

            if (!votacao.IdUsuarioVencedorProvisorio.HasValue)
                throw new Exception("Resultado sem vencedor definido. Encerre a votação primeiro.");

            var idVencedor = votacao.IdUsuarioVencedorProvisorio.Value;

            votacao.Status = "APROVADA";
            votacao.AprovadaPorUsuario = adminId;
            votacao.AprovadaEm = DateTime.UtcNow;

            // Atualiza classificação do vencedor
            AtualizarPremio(partida.IdTemporada, partida.IdGrupo, idVencedor, dto.Tipo);

            _context.SaveChanges();

            return GetVoteStatus(matchId);
        }

        // Retorna o status atual das votações da partida
        public VoteStatusDTO GetVoteStatus(ulong matchId)
        {
            var todasVotacoes = _context.VotacoesPartida
                .Where(v => v.IdPartida == matchId)
                .OrderByDescending(v => v.Rodada)
                .ToList();

            var mvpAtual = todasVotacoes.FirstOrDefault(v => v.Tipo == "MVP");
            var bolaMurchaAtual = todasVotacoes.FirstOrDefault(v => v.Tipo == "BOLA_MURCHA");

            return new VoteStatusDTO
            {
                Mvp = mvpAtual != null ? BuildRoundDTO(mvpAtual) : null,
                BolaMurcha = bolaMurchaAtual != null ? BuildRoundDTO(bolaMurchaAtual) : null
            };
        }

        // ── Auxiliares ────────────────────────────────────────────────────────

        private VoteRoundDTO BuildRoundDTO(VotacaoPartida votacao)
        {
            var votos = _context.Votos
                .Where(v => v.IdVotacao == votacao.IdVotacao)
                .ToList();

            var contagem = votos
                .GroupBy(v => v.IdUsuarioVotado)
                .Select(g => new { IdUsuario = g.Key, Total = g.Count() })
                .ToList();

            List<VoteTallyDTO> candidatos;

            if (votacao.Rodada == 1 && votacao.Status == "ABERTA")
            {
                // Candidatos = todos os confirmados na partida (mesclado com contagem de votos)
                var confirmados = _context.PresencasPartida
                    .Where(p => p.IdPartida == votacao.IdPartida && p.Status == "CONFIRMADO")
                    .Join(_context.Usuarios, p => p.IdUsuario, u => u.IdUsuario,
                        (p, u) => new { u.IdUsuario, u.Nome })
                    .ToList();

                candidatos = confirmados
                    .Select(c => new VoteTallyDTO
                    {
                        IdUsuario = c.IdUsuario,
                        Nome = c.Nome,
                        Votos = contagem.FirstOrDefault(x => x.IdUsuario == c.IdUsuario)?.Total ?? 0
                    })
                    .OrderByDescending(c => c.Votos)
                    .ToList();
            }
            else
            {
                candidatos = contagem
                    .Join(_context.Usuarios,
                        c => c.IdUsuario,
                        u => u.IdUsuario,
                        (c, u) => new VoteTallyDTO
                        {
                            IdUsuario = u.IdUsuario,
                            Nome = u.Nome,
                            Votos = c.Total
                        })
                    .OrderByDescending(c => c.Votos)
                    .ToList();
            }

            string? nomeVencedor = null;
            if (votacao.IdUsuarioVencedorProvisorio.HasValue)
            {
                var vencedor = _context.Usuarios
                    .FirstOrDefault(u => u.IdUsuario == votacao.IdUsuarioVencedorProvisorio.Value);
                nomeVencedor = vencedor?.Nome;
            }

            return new VoteRoundDTO
            {
                IdVotacao = votacao.IdVotacao,
                Tipo = votacao.Tipo,
                Rodada = votacao.Rodada,
                Status = votacao.Status,
                Candidatos = candidatos,
                IdVencedorProvisorio = votacao.IdUsuarioVencedorProvisorio,
                NomeVencedorProvisorio = nomeVencedor
            };
        }

        private void AtualizarPremio(ulong idTemporada, ulong idGrupo, ulong idUsuario, string tipo)
        {
            var classTemp = _context.ClassificacoesTemporada
                .FirstOrDefault(c => c.IdTemporada == idTemporada && c.IdUsuario == idUsuario);

            if (classTemp != null)
            {
                if (tipo == "MVP") classTemp.Mvps += 1;
                else classTemp.BolasMurchas += 1;
                classTemp.AtualizadoEm = DateTime.UtcNow;
            }

            var classGeral = _context.ClassificacoesGeralGrupo
                .FirstOrDefault(c => c.IdGrupo == idGrupo && c.IdUsuario == idUsuario);

            if (classGeral != null)
            {
                if (tipo == "MVP") classGeral.Mvps += 1;
                else classGeral.BolasMurchas += 1;
                classGeral.AtualizadoEm = DateTime.UtcNow;
            }
        }

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
