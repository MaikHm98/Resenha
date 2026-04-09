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
        private readonly IInviteEmailService _inviteEmailService;

        public MatchService(ResenhaDbContext context, IInviteEmailService inviteEmailService)
        {
            _context = context;
            _inviteEmailService = inviteEmailService;
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
                CriadoPorUsuario = userId,
                IdCicloCapitao = _context.CiclosCapitao
                    .Where(c => c.IdGrupo == dto.IdGrupo && c.Status == "ATIVO")
                    .Select(c => (ulong?)c.IdCiclo)
                    .FirstOrDefault()
            };

            _context.Partidas.Add(partida);
            _context.SaveChanges();

            var ciclo = ObterCicloDaPartida(partida);
            _context.DesafiosPartida.Add(new DesafioPartida
            {
                IdPartida = partida.IdPartida,
                IdCapitaoAtual = ciclo?.IdCapitaoAtual,
                IdDesafiante = ciclo?.IdDesafianteAtual,
                AtualizadoEm = DateTime.UtcNow
            });
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
                        (pr, u) => new { pr.Status, u.Nome, u.Convidado, pr.IdUsuario, u.Goleiro })
                    .ToList();

                var confirmados   = presencas.Where(x => x.Status == "CONFIRMADO")
                    .Select(x => new ConfirmadoInfoDTO { Nome = FormatarNomeExibicao(x.Nome, x.Convidado), Goleiro = x.Goleiro }).ToList();
                var ausentesNomes = presencas.Where(x => x.Status == "AUSENTE").Select(x => FormatarNomeExibicao(x.Nome, x.Convidado)).ToList();
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

        public List<ResumoPartidaHistoricoDTO> GetGroupMatchHistory(ulong userId, ulong groupId)
        {
            var grupo = _context.Grupos.FirstOrDefault(g => g.IdGrupo == groupId && g.Ativo);
            if (grupo == null)
                throw new Exception("Grupo não encontrado.");

            ValidarMembroAtivoNoGrupo(userId, groupId);

            var partidas = _context.Partidas
                .Where(p => p.IdGrupo == groupId)
                .OrderByDescending(p => p.DataHoraJogo)
                .ToList();

            return partidas.Select(BuildResumoHistorico).ToList();
        }

        public DetalhePartidaDTO GetMatchDetails(ulong userId, ulong matchId)
        {
            var partida = _context.Partidas.FirstOrDefault(p => p.IdPartida == matchId);
            if (partida == null)
                throw new Exception("Partida não encontrada.");

            ValidarMembroAtivoNoGrupo(userId, partida.IdGrupo);

            var presencas = _context.PresencasPartida
                .Where(p => p.IdPartida == matchId && (p.Status == "CONFIRMADO" || p.Status == "AUSENTE"))
                .Join(_context.Usuarios,
                    p => p.IdUsuario,
                    u => u.IdUsuario,
                    (p, u) => new
                    {
                        p.IdUsuario,
                        p.Status,
                        u.Nome,
                        u.Convidado,
                        u.Goleiro
                    })
                .ToList();

            var confirmados = presencas.Where(p => p.Status == "CONFIRMADO").ToList();
            var ausentes = presencas.Where(p => p.Status == "AUSENTE").ToList();

            var idsMembros = _context.GrupoUsuarios
                .Where(gu => gu.IdGrupo == partida.IdGrupo && gu.Ativo)
                .Select(gu => gu.IdUsuario)
                .ToList();

            var idsResponderam = presencas.Select(p => p.IdUsuario).ToHashSet();
            var naoConfirmaram = _context.Usuarios
                .Where(u => idsMembros.Contains(u.IdUsuario) && !idsResponderam.Contains(u.IdUsuario))
                .Select(u => u.Nome)
                .ToList();

            var estatisticas = _context.EstatisticasPartida
                .Where(e => e.IdPartida == matchId)
                .ToList()
                .ToDictionary(e => e.IdUsuario, e => e);

            var times = _context.TimesPartida
                .Where(t => t.IdPartida == matchId)
                .OrderBy(t => t.NumeroTime)
                .ToList();

            TimePartidaDetalheDTO? time1 = null;
            TimePartidaDetalheDTO? time2 = null;

            foreach (var time in times)
            {
                var nomeCapitao = _context.Usuarios
                    .Where(u => u.IdUsuario == time.IdCapitao)
                    .Select(u => u.Nome)
                    .FirstOrDefault() ?? "Capitão não encontrado";

                var jogadoresBase = _context.JogadoresTimePartida
                    .Where(j => j.IdTime == time.IdTime)
                    .Join(_context.Usuarios,
                        j => j.IdUsuario,
                        u => u.IdUsuario,
                        (j, u) => new { u.IdUsuario, u.Nome, u.Goleiro })
                    .ToList();

                var jogadores = jogadoresBase
                    .Select(u => new JogadorPartidaDetalheDTO
                    {
                        IdUsuario = u.IdUsuario,
                        Nome = u.Nome,
                        Goleiro = u.Goleiro,
                        Gols = estatisticas.TryGetValue(u.IdUsuario, out var stat) ? stat.Gols : 0,
                        Assistencias = estatisticas.TryGetValue(u.IdUsuario, out var statAssist) ? statAssist.Assistencias : 0
                    })
                    .OrderByDescending(j => j.Gols)
                    .ThenByDescending(j => j.Assistencias)
                    .ThenBy(j => j.Nome)
                    .ToList();

                var dto = new TimePartidaDetalheDTO
                {
                    NumeroTime = time.NumeroTime,
                    IdCapitao = time.IdCapitao,
                    NomeCapitao = nomeCapitao,
                    Jogadores = jogadores
                };

                if (time.NumeroTime == 1) time1 = dto;
                if (time.NumeroTime == 2) time2 = dto;
            }

            var resultado = _context.ResultadosPartida.FirstOrDefault(r => r.IdPartida == matchId);
            string? nomeCapitaoVencedor = null;
            if (resultado != null)
            {
                var timeVencedor = times.FirstOrDefault(t => t.NumeroTime == resultado.VencedorNumeroTime);
                if (timeVencedor != null)
                {
                    nomeCapitaoVencedor = _context.Usuarios
                        .Where(u => u.IdUsuario == timeVencedor.IdCapitao)
                        .Select(u => u.Nome)
                        .FirstOrDefault();
                }
            }

            var premios = _context.VotacoesPartida
                .Where(v => v.IdPartida == matchId && (v.Status == "APROVADA" || v.Status == "APURADA"))
                .OrderBy(v => v.Tipo)
                .ThenByDescending(v => v.Rodada)
                .ToList()
                .GroupBy(v => v.Tipo)
                .Select(g =>
                {
                    var votacao = g.First();
                    var nomeVencedor = votacao.IdUsuarioVencedorProvisorio.HasValue
                        ? _context.Usuarios.Where(u => u.IdUsuario == votacao.IdUsuarioVencedorProvisorio.Value).Select(u => u.Nome).FirstOrDefault()
                        : null;

                    return new PremioPartidaDetalheDTO
                    {
                        Tipo = votacao.Tipo,
                        Status = votacao.Status,
                        Rodada = votacao.Rodada,
                        IdVencedor = votacao.IdUsuarioVencedorProvisorio,
                        NomeVencedor = nomeVencedor
                    };
                })
                .ToList();

            return new DetalhePartidaDTO
            {
                IdPartida = partida.IdPartida,
                IdGrupo = partida.IdGrupo,
                DataHoraJogo = partida.DataHoraJogo,
                Status = partida.Status,
                Observacao = partida.Observacao,
                LimiteVagas = partida.LimiteVagas,
                TotalConfirmados = confirmados.Count,
                TotalAusentes = ausentes.Count,
                GolsTime1 = resultado?.GolsTime1,
                GolsTime2 = resultado?.GolsTime2,
                NumeroTimeVencedor = resultado?.VencedorNumeroTime,
                NomeCapitaoVencedor = nomeCapitaoVencedor,
                Time1 = time1,
                Time2 = time2,
                ConfirmadosNomes = confirmados.Select(c => c.Nome).OrderBy(n => n).ToList(),
                AusentesNomes = ausentes.Select(a => a.Nome).OrderBy(n => n).ToList(),
                NaoConfirmaramNomes = naoConfirmaram.OrderBy(n => n).ToList(),
                Premios = premios
            };
        }

        public DesafioPartidaStatusDTO GetChallengeStatus(ulong userId, ulong matchId)
        {
            var partida = _context.Partidas.FirstOrDefault(p => p.IdPartida == matchId);
            if (partida == null)
                throw new Exception("Partida não encontrada.");

            ValidarMembroAtivoNoGrupo(userId, partida.IdGrupo);

            var desafio = ObterOuCriarDesafioPartida(partida);
            SincronizarDesafioPartida(partida, desafio);

            var confirmados = _context.PresencasPartida
                .Where(pr => pr.IdPartida == matchId && pr.Status == "CONFIRMADO")
                .Join(_context.Usuarios,
                    pr => pr.IdUsuario,
                    u => u.IdUsuario,
                    (pr, u) => new { u.IdUsuario, u.Nome, u.Convidado, u.Goleiro })
                .ToList();

            var totalConfirmados = confirmados.Count;
            var goleirosConfirmados = confirmados.Count(c => c.Goleiro);
            var horarioLimiteConfirmacao = partida.DataHoraJogo.AddMinutes(-20);
            var confirmacoesEncerradas = GetAgoraBrasilia() > horarioLimiteConfirmacao;

            var alertas = new List<string>();
            var bloqueios = new List<string>();

            if (totalConfirmados < 12)
                bloqueios.Add("A partida precisa de pelo menos 12 confirmados para liberar a montagem.");

            if (goleirosConfirmados == 0)
                bloqueios.Add("A partida precisa ter pelo menos 1 goleiro confirmado.");

            if (goleirosConfirmados == 1)
                alertas.Add("A partida possui apenas 1 goleiro confirmado.");

            if (confirmacoesEncerradas)
                alertas.Add($"A janela de confirmação foi encerrada às {horarioLimiteConfirmacao:HH:mm}.");

            if (!desafio.IdDesafiante.HasValue)
                bloqueios.Add("Ainda não há desafiante definido para iniciar a montagem.");

            var usuarioEhCapitaoAtual = desafio.IdCapitaoAtual == userId;
            var usuarioEhDesafiante = desafio.IdDesafiante == userId;
            var usuarioEhCapitao = usuarioEhCapitaoAtual || usuarioEhDesafiante;
            var paridadeDesafiante = ObterParidadeOposta(desafio.EscolhaParidadeCapitaoAtual);
            var ambosNumerosInformados = desafio.NumeroCapitaoAtual.HasValue && desafio.NumeroDesafiante.HasValue;
            var paridadeCapitaoAtualGoleiro = desafio.EscolhaParidadeGoleiroCapitaoAtual ?? desafio.EscolhaParidadeCapitaoAtual;
            var paridadeDesafianteGoleiro = ObterParidadeOposta(paridadeCapitaoAtualGoleiro);
            var ambosNumerosGoleiroInformados = desafio.NumeroGoleiroCapitaoAtual.HasValue && desafio.NumeroGoleiroDesafiante.HasValue;
            var jogadoresLinhaDisponiveis = ListarJogadoresLinhaDisponiveis(partida, desafio);
            var goleirosDisponiveis = ListarGoleirosDisponiveis(partida, desafio);
            var timeCapitaoAtual = BuildTimeMontagemDTO(partida.IdPartida, desafio.IdCapitaoAtual);
            var timeDesafiante = BuildTimeMontagemDTO(partida.IdPartida, desafio.IdDesafiante);

            return new DesafioPartidaStatusDTO
            {
                IdPartida = partida.IdPartida,
                IdGrupo = partida.IdGrupo,
                DataHoraJogo = partida.DataHoraJogo,
                StatusPartida = partida.Status,
                StatusDesafio = desafio.StatusFluxo,
                TotalConfirmados = totalConfirmados,
                MinimoConfirmados = 12,
                GoleirosConfirmados = goleirosConfirmados,
                MaximoGoleiros = 2,
                HorarioLimiteConfirmacao = horarioLimiteConfirmacao,
                ConfirmacoesEncerradas = confirmacoesEncerradas,
                PodeIniciarMontagem = bloqueios.Count == 0,
                UsuarioEhCapitao = usuarioEhCapitao,
                UsuarioEhCapitaoAtual = usuarioEhCapitaoAtual,
                UsuarioEhDesafiante = usuarioEhDesafiante,
                UsuarioPodeInteragir = usuarioEhCapitao,
                UsuarioPodeEscolherParidade = usuarioEhCapitaoAtual &&
                    (desafio.StatusFluxo == "PRONTA_PARA_MONTAGEM" || desafio.StatusFluxo == "PAR_IMPAR_LINHA") &&
                    string.IsNullOrWhiteSpace(desafio.EscolhaParidadeCapitaoAtual) &&
                    bloqueios.Count == 0,
                UsuarioPodeInformarNumero = usuarioEhCapitao &&
                    desafio.StatusFluxo == "PAR_IMPAR_LINHA" &&
                    !string.IsNullOrWhiteSpace(desafio.EscolhaParidadeCapitaoAtual) &&
                    ((usuarioEhCapitaoAtual && !desafio.NumeroCapitaoAtual.HasValue) ||
                     (usuarioEhDesafiante && !desafio.NumeroDesafiante.HasValue)),
                UsuarioPodeEscolherJogadorLinha = usuarioEhCapitao &&
                    desafio.StatusFluxo == "ESCOLHA_EM_ANDAMENTO" &&
                    desafio.IdProximoCapitaoEscolha == userId &&
                    jogadoresLinhaDisponiveis.Count > 0,
                UsuarioPodeEscolherParidadeGoleiro = false,
                UsuarioPodeInformarNumeroGoleiro = usuarioEhCapitao &&
                    desafio.StatusFluxo == "PAR_IMPAR_GOLEIROS" &&
                    !string.IsNullOrWhiteSpace(paridadeCapitaoAtualGoleiro) &&
                    ((usuarioEhCapitaoAtual && !desafio.NumeroGoleiroCapitaoAtual.HasValue) ||
                     (usuarioEhDesafiante && !desafio.NumeroGoleiroDesafiante.HasValue)),
                UsuarioPodeEscolherGoleiro = usuarioEhCapitao &&
                    desafio.StatusFluxo == "ESCOLHA_GOLEIRO_EM_ANDAMENTO" &&
                    desafio.IdProximoCapitaoEscolhaGoleiro == userId &&
                    goleirosDisponiveis.Count == 2,
                PossuiDesafianteDefinido = desafio.IdDesafiante.HasValue,
                RequerDefinicaoManualGoleiro = goleirosConfirmados == 1,
                ParidadeCapitaoAtual = desafio.EscolhaParidadeCapitaoAtual,
                ParidadeDesafiante = paridadeDesafiante,
                CapitaoAtualJaInformouNumero = desafio.NumeroCapitaoAtual.HasValue,
                DesafianteJaInformouNumero = desafio.NumeroDesafiante.HasValue,
                NumeroCapitaoAtual = ambosNumerosInformados ? desafio.NumeroCapitaoAtual : null,
                NumeroDesafiante = ambosNumerosInformados ? desafio.NumeroDesafiante : null,
                SomaParImparLinha = desafio.SomaParImparLinha,
                ParidadeCapitaoAtualGoleiro = paridadeCapitaoAtualGoleiro,
                ParidadeDesafianteGoleiro = paridadeDesafianteGoleiro,
                CapitaoAtualJaInformouNumeroGoleiro = desafio.NumeroGoleiroCapitaoAtual.HasValue,
                DesafianteJaInformouNumeroGoleiro = desafio.NumeroGoleiroDesafiante.HasValue,
                NumeroCapitaoAtualGoleiro = ambosNumerosGoleiroInformados ? desafio.NumeroGoleiroCapitaoAtual : null,
                NumeroDesafianteGoleiro = ambosNumerosGoleiroInformados ? desafio.NumeroGoleiroDesafiante : null,
                SomaParImparGoleiro = desafio.SomaParImparGoleiro,
                Alertas = alertas,
                Bloqueios = bloqueios,
                CapitaoAtual = desafio.IdCapitaoAtual.HasValue ? BuildCapitaoDTO(desafio.IdCapitaoAtual.Value) : null,
                Desafiante = desafio.IdDesafiante.HasValue ? BuildCapitaoDTO(desafio.IdDesafiante.Value) : null,
                VencedorParImparLinha = desafio.IdVencedorParImparLinha.HasValue ? BuildCapitaoDTO(desafio.IdVencedorParImparLinha.Value) : null,
                ProximoCapitaoEscolha = desafio.IdProximoCapitaoEscolha.HasValue ? BuildCapitaoDTO(desafio.IdProximoCapitaoEscolha.Value) : null,
                VencedorParImparGoleiro = desafio.IdVencedorParImparGoleiro.HasValue ? BuildCapitaoDTO(desafio.IdVencedorParImparGoleiro.Value) : null,
                ProximoCapitaoEscolhaGoleiro = desafio.IdProximoCapitaoEscolhaGoleiro.HasValue ? BuildCapitaoDTO(desafio.IdProximoCapitaoEscolhaGoleiro.Value) : null,
                TimeCapitaoAtual = timeCapitaoAtual,
                TimeDesafiante = timeDesafiante,
                JogadoresLinhaDisponiveis = jogadoresLinhaDisponiveis,
                GoleirosDisponiveis = goleirosDisponiveis
            };
        }

        public DesafioPartidaStatusDTO StartLineDraw(ulong userId, ulong matchId, IniciarParImparLinhaDTO dto)
        {
            var partida = _context.Partidas.FirstOrDefault(p => p.IdPartida == matchId);
            if (partida == null)
                throw new Exception("Partida não encontrada.");

            ValidarMembroAtivoNoGrupo(userId, partida.IdGrupo);

            var desafio = ObterOuCriarDesafioPartida(partida);
            SincronizarDesafioPartida(partida, desafio);

            if (desafio.IdCapitaoAtual != userId)
                throw new Exception("Apenas o capitão atual pode escolher entre par ou ímpar.");

            if (!desafio.IdDesafiante.HasValue)
                throw new Exception("Ainda não há desafiante definido para esta partida.");

            var escolha = (dto.EscolhaParidade ?? string.Empty).Trim().ToUpperInvariant();
            if (escolha != "PAR" && escolha != "IMPAR")
                throw new Exception("Escolha inválida. Use 'PAR' ou 'IMPAR'.");

            if (desafio.StatusFluxo != "PRONTA_PARA_MONTAGEM" && desafio.StatusFluxo != "PAR_IMPAR_LINHA")
                throw new Exception("O par ou ímpar dos jogadores não pode ser iniciado neste momento.");

            var statusAtual = GetChallengeStatus(userId, matchId);
            if (!statusAtual.PodeIniciarMontagem)
                throw new Exception("A partida ainda não atende as regras mínimas para iniciar a montagem.");

            desafio.StatusFluxo = "PAR_IMPAR_LINHA";
            desafio.EscolhaParidadeCapitaoAtual = escolha;
            desafio.NumeroCapitaoAtual = null;
            desafio.NumeroDesafiante = null;
            desafio.SomaParImparLinha = null;
            desafio.IdVencedorParImparLinha = null;
            desafio.IdProximoCapitaoEscolha = null;
            desafio.AtualizadoEm = DateTime.UtcNow;
            _context.SaveChanges();

            return GetChallengeStatus(userId, matchId);
        }

        public DesafioPartidaStatusDTO SubmitLineDrawNumber(ulong userId, ulong matchId, RegistrarNumeroParImparLinhaDTO dto)
        {
            var partida = _context.Partidas.FirstOrDefault(p => p.IdPartida == matchId);
            if (partida == null)
                throw new Exception("Partida não encontrada.");

            ValidarMembroAtivoNoGrupo(userId, partida.IdGrupo);

            var desafio = ObterOuCriarDesafioPartida(partida);
            SincronizarDesafioPartida(partida, desafio);

            if (desafio.StatusFluxo != "PAR_IMPAR_LINHA")
                throw new Exception("O par ou ímpar dos jogadores não está em andamento.");

            if (desafio.IdCapitaoAtual != userId && desafio.IdDesafiante != userId)
                throw new Exception("Somente os capitães desta partida podem informar um número.");

            if (string.IsNullOrWhiteSpace(desafio.EscolhaParidadeCapitaoAtual))
                throw new Exception("O capitão atual ainda não escolheu entre par ou ímpar.");

            if (dto.Numero < 0 || dto.Numero > 10)
                throw new Exception("O número informado deve estar entre 0 e 10.");

            if (desafio.IdCapitaoAtual == userId)
            {
                if (desafio.NumeroCapitaoAtual.HasValue)
                    throw new Exception("O capitão atual já informou seu número.");

                desafio.NumeroCapitaoAtual = dto.Numero;
            }
            else
            {
                if (desafio.NumeroDesafiante.HasValue)
                    throw new Exception("O desafiante já informou seu número.");

                desafio.NumeroDesafiante = dto.Numero;
            }

            if (desafio.NumeroCapitaoAtual.HasValue && desafio.NumeroDesafiante.HasValue)
            {
                desafio.SomaParImparLinha = desafio.NumeroCapitaoAtual.Value + desafio.NumeroDesafiante.Value;
                var resultadoPar = desafio.SomaParImparLinha.Value % 2 == 0 ? "PAR" : "IMPAR";
                var vencedor = resultadoPar == desafio.EscolhaParidadeCapitaoAtual
                    ? desafio.IdCapitaoAtual
                    : desafio.IdDesafiante;

                desafio.IdVencedorParImparLinha = vencedor;
                desafio.IdProximoCapitaoEscolha = vencedor;
                desafio.StatusFluxo = "ESCOLHA_EM_ANDAMENTO";
                GarantirTimesDesafio(partida, desafio);
            }

            desafio.AtualizadoEm = DateTime.UtcNow;
            _context.SaveChanges();

            return GetChallengeStatus(userId, matchId);
        }

        public DesafioPartidaStatusDTO PickLinePlayer(ulong userId, ulong matchId, EscolherJogadorLinhaDTO dto)
        {
            var partida = _context.Partidas.FirstOrDefault(p => p.IdPartida == matchId);
            if (partida == null)
                throw new Exception("Partida não encontrada.");

            ValidarMembroAtivoNoGrupo(userId, partida.IdGrupo);

            var desafio = ObterOuCriarDesafioPartida(partida);
            SincronizarDesafioPartida(partida, desafio);

            if (desafio.StatusFluxo != "ESCOLHA_EM_ANDAMENTO")
                throw new Exception("A escolha dos jogadores de linha não está em andamento.");

            if (desafio.IdProximoCapitaoEscolha != userId)
                throw new Exception("Não é a sua vez de escolher.");

            if (!desafio.IdCapitaoAtual.HasValue || !desafio.IdDesafiante.HasValue)
                throw new Exception("Os dois capitães precisam estar definidos para escolher os jogadores.");

            var jogador = _context.PresencasPartida
                .Where(pr => pr.IdPartida == matchId && pr.Status == "CONFIRMADO" && pr.IdUsuario == dto.IdUsuarioJogador)
                .Join(_context.Usuarios,
                    pr => pr.IdUsuario,
                    u => u.IdUsuario,
                    (pr, u) => new { u.IdUsuario, Nome = u.Convidado ? $"{u.Nome} (Convidado)" : u.Nome, u.Goleiro })
                .FirstOrDefault();

            if (jogador == null)
                throw new Exception("Jogador não encontrado na lista de confirmados.");

            if (jogador.Goleiro)
                throw new Exception("Os goleiros são escolhidos em uma etapa separada.");

            if (dto.IdUsuarioJogador == desafio.IdCapitaoAtual.Value || dto.IdUsuarioJogador == desafio.IdDesafiante.Value)
                throw new Exception("Os capitães já pertencem aos seus times e não entram na escolha.");

            GarantirTimesDesafio(partida, desafio);

            var jogadorJaEscolhido = _context.TimesPartida
                .Where(t => t.IdPartida == matchId)
                .Join(_context.JogadoresTimePartida,
                    t => t.IdTime,
                    j => j.IdTime,
                    (t, j) => new { t.IdPartida, j.IdUsuario })
                .Any(x => x.IdPartida == matchId && x.IdUsuario == dto.IdUsuarioJogador);

            if (jogadorJaEscolhido)
                throw new Exception("Este jogador já foi escolhido.");

            var timeEscolha = ObterTimePorCapitao(matchId, userId);
            if (timeEscolha == null)
                throw new Exception("Não foi possível localizar o time do capitão para registrar a escolha.");

            _context.JogadoresTimePartida.Add(new JogadorTimePartida
            {
                IdTime = timeEscolha.IdTime,
                IdUsuario = dto.IdUsuarioJogador
            });

            var proximoCapitao = userId == desafio.IdCapitaoAtual.Value
                ? desafio.IdDesafiante.Value
                : desafio.IdCapitaoAtual.Value;

            _context.SaveChanges();

            var restantes = ListarJogadoresLinhaDisponiveis(partida, desafio);
            if (restantes.Count == 0)
            {
                var goleirosDisponiveis = ListarGoleirosDisponiveis(partida, desafio);

                desafio.IdProximoCapitaoEscolha = null;
                if (goleirosDisponiveis.Count >= 2)
                {
                    desafio.StatusFluxo = "PAR_IMPAR_GOLEIROS";
                    desafio.EscolhaParidadeGoleiroCapitaoAtual = desafio.EscolhaParidadeCapitaoAtual;
                    desafio.NumeroGoleiroCapitaoAtual = null;
                    desafio.NumeroGoleiroDesafiante = null;
                    desafio.SomaParImparGoleiro = null;
                    desafio.IdVencedorParImparGoleiro = null;
                    desafio.IdProximoCapitaoEscolhaGoleiro = null;
                }
                else if (goleirosDisponiveis.Count == 1)
                {
                    desafio.StatusFluxo = "DEFINICAO_MANUAL_GOLEIRO";
                }
                else
                {
                    desafio.StatusFluxo = "TIMES_FECHADOS";
                }
            }
            else
            {
                desafio.IdProximoCapitaoEscolha = proximoCapitao;
            }

            desafio.AtualizadoEm = DateTime.UtcNow;
            _context.SaveChanges();

            return GetChallengeStatus(userId, matchId);
        }

        public DesafioPartidaStatusDTO StartGoalkeeperDraw(ulong userId, ulong matchId, IniciarParImparGoleiroDTO dto)
        {
            var partida = _context.Partidas.FirstOrDefault(p => p.IdPartida == matchId);
            if (partida == null)
                throw new Exception("Partida não encontrada.");

            ValidarMembroAtivoNoGrupo(userId, partida.IdGrupo);

            var desafio = ObterOuCriarDesafioPartida(partida);
            SincronizarDesafioPartida(partida, desafio);

            if (desafio.StatusFluxo != "PAR_IMPAR_GOLEIROS")
                throw new Exception("O par ou impar dos goleiros não pode ser iniciado neste momento.");

            var goleirosDisponiveis = ListarGoleirosDisponiveis(partida, desafio);
            if (goleirosDisponiveis.Count < 2)
                throw new Exception("A etapa de goleiros exige dois goleiros disponíveis.");

            desafio.EscolhaParidadeGoleiroCapitaoAtual = desafio.EscolhaParidadeCapitaoAtual;
            desafio.NumeroGoleiroCapitaoAtual = null;
            desafio.NumeroGoleiroDesafiante = null;
            desafio.SomaParImparGoleiro = null;
            desafio.IdVencedorParImparGoleiro = null;
            desafio.IdProximoCapitaoEscolhaGoleiro = null;
            desafio.AtualizadoEm = DateTime.UtcNow;
            _context.SaveChanges();

            return GetChallengeStatus(userId, matchId);
        }

        public DesafioPartidaStatusDTO SubmitGoalkeeperDrawNumber(ulong userId, ulong matchId, RegistrarNumeroParImparGoleiroDTO dto)
        {
            var partida = _context.Partidas.FirstOrDefault(p => p.IdPartida == matchId);
            if (partida == null)
                throw new Exception("Partida não encontrada.");

            ValidarMembroAtivoNoGrupo(userId, partida.IdGrupo);

            var desafio = ObterOuCriarDesafioPartida(partida);
            SincronizarDesafioPartida(partida, desafio);

            if (desafio.StatusFluxo != "PAR_IMPAR_GOLEIROS")
                throw new Exception("O par ou impar dos goleiros não está em andamento.");

            if (desafio.IdCapitaoAtual != userId && desafio.IdDesafiante != userId)
                throw new Exception("Somente os capitães desta partida podem informar um número.");

            var escolhaParidadeGoleiro = desafio.EscolhaParidadeGoleiroCapitaoAtual ?? desafio.EscolhaParidadeCapitaoAtual;
            if (string.IsNullOrWhiteSpace(escolhaParidadeGoleiro))
                throw new Exception("O capitão atual ainda não escolheu entre par ou impar dos goleiros.");

            desafio.EscolhaParidadeGoleiroCapitaoAtual = escolhaParidadeGoleiro;

            if (dto.Numero < 0 || dto.Numero > 10)
                throw new Exception("O número informado deve estar entre 0 e 10.");

            if (desafio.IdCapitaoAtual == userId)
            {
                if (desafio.NumeroGoleiroCapitaoAtual.HasValue)
                    throw new Exception("O capitão atual já informou seu número dos goleiros.");

                desafio.NumeroGoleiroCapitaoAtual = dto.Numero;
            }
            else
            {
                if (desafio.NumeroGoleiroDesafiante.HasValue)
                    throw new Exception("O desafiante já informou seu número dos goleiros.");

                desafio.NumeroGoleiroDesafiante = dto.Numero;
            }

            if (desafio.NumeroGoleiroCapitaoAtual.HasValue && desafio.NumeroGoleiroDesafiante.HasValue)
            {
                desafio.SomaParImparGoleiro = desafio.NumeroGoleiroCapitaoAtual.Value + desafio.NumeroGoleiroDesafiante.Value;
                var resultadoPar = desafio.SomaParImparGoleiro.Value % 2 == 0 ? "PAR" : "IMPAR";
                var vencedor = resultadoPar == escolhaParidadeGoleiro
                    ? desafio.IdCapitaoAtual
                    : desafio.IdDesafiante;

                desafio.IdVencedorParImparGoleiro = vencedor;
                desafio.IdProximoCapitaoEscolhaGoleiro = vencedor;
                desafio.StatusFluxo = "ESCOLHA_GOLEIRO_EM_ANDAMENTO";
            }

            desafio.AtualizadoEm = DateTime.UtcNow;
            _context.SaveChanges();

            return GetChallengeStatus(userId, matchId);
        }

        public DesafioPartidaStatusDTO PickGoalkeeper(ulong userId, ulong matchId, EscolherGoleiroDTO dto)
        {
            var partida = _context.Partidas.FirstOrDefault(p => p.IdPartida == matchId);
            if (partida == null)
                throw new Exception("Partida não encontrada.");

            ValidarMembroAtivoNoGrupo(userId, partida.IdGrupo);

            var desafio = ObterOuCriarDesafioPartida(partida);
            SincronizarDesafioPartida(partida, desafio);

            if (desafio.StatusFluxo != "ESCOLHA_GOLEIRO_EM_ANDAMENTO")
                throw new Exception("A escolha dos goleiros não está em andamento.");

            if (desafio.IdProximoCapitaoEscolhaGoleiro != userId)
                throw new Exception("Não é a sua vez de escolher o goleiro.");

            GarantirTimesDesafio(partida, desafio);

            var goleirosDisponiveis = ListarGoleirosDisponiveis(partida, desafio);
            if (goleirosDisponiveis.Count != 2)
                throw new Exception("A escolha dos goleiros exige exatamente dois goleiros disponíveis.");

            var goleiroEscolhido = goleirosDisponiveis.FirstOrDefault(g => g.IdUsuario == dto.IdUsuarioGoleiro);
            if (goleiroEscolhido == null)
                throw new Exception("O goleiro escolhido não está disponível.");

            var outroGoleiro = goleirosDisponiveis.First(g => g.IdUsuario != dto.IdUsuarioGoleiro);

            var timeEscolha = ObterTimePorCapitao(matchId, userId);
            if (timeEscolha == null)
                throw new Exception("Não foi possível localizar o time do capitão para registrar o goleiro.");

            var outroCapitao = desafio.IdCapitaoAtual == userId
                ? desafio.IdDesafiante!.Value
                : desafio.IdCapitaoAtual!.Value;

            var outroTime = ObterTimePorCapitao(matchId, outroCapitao);
            if (outroTime == null)
                throw new Exception("Não foi possível localizar o outro time para completar os goleiros.");

            _context.JogadoresTimePartida.Add(new JogadorTimePartida
            {
                IdTime = timeEscolha.IdTime,
                IdUsuario = goleiroEscolhido.IdUsuario
            });

            _context.JogadoresTimePartida.Add(new JogadorTimePartida
            {
                IdTime = outroTime.IdTime,
                IdUsuario = outroGoleiro.IdUsuario
            });

            desafio.IdProximoCapitaoEscolhaGoleiro = null;
            desafio.StatusFluxo = "TIMES_FECHADOS";
            desafio.AtualizadoEm = DateTime.UtcNow;
            _context.SaveChanges();

            return GetChallengeStatus(userId, matchId);
        }

        public PresenceResponseDTO AddGuestToMatch(ulong userId, ulong matchId, AddGuestToMatchDTO dto)
        {
            using var transaction = _context.Database.BeginTransaction(IsolationLevel.Serializable);

            var partida = _context.Partidas.FirstOrDefault(p => p.IdPartida == matchId);
            if (partida == null)
                throw new Exception("Partida nao encontrada.");

            if (partida.Status != "ABERTA")
                throw new Exception("Apenas partidas abertas aceitam convidados.");

            if (GetAgoraBrasilia() > partida.DataHoraJogo.AddMinutes(-20))
                throw new Exception("Os convidados podem ser adicionados somente ate 20 minutos antes do jogo.");

            var membro = _context.GrupoUsuarios
                .FirstOrDefault(gu => gu.IdGrupo == partida.IdGrupo && gu.IdUsuario == userId && gu.Ativo);

            if (membro == null)
                throw new Exception("Voce nao e membro deste grupo.");

            if (membro.Perfil != "ADMIN")
                throw new Exception("Apenas administradores podem adicionar convidados.");

            var nomeConvidado = (dto.Nome ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(nomeConvidado))
                throw new Exception("O nome do convidado e obrigatorio.");

            var totalConfirmados = _context.PresencasPartida
                .Count(pr => pr.IdPartida == matchId && pr.Status == "CONFIRMADO");

            if (totalConfirmados >= partida.LimiteVagas)
                throw new Exception($"Vagas encerradas. Limite de {partida.LimiteVagas} jogadores atingido.");

            var convidadoDuplicado = _context.PresencasPartida
                .Where(pr => pr.IdPartida == matchId && pr.Status == "CONFIRMADO")
                .Join(_context.Usuarios,
                    pr => pr.IdUsuario,
                    u => u.IdUsuario,
                    (pr, u) => new { u.Nome, u.Convidado })
                .ToList()
                .Any(x => x.Convidado && string.Equals(x.Nome, nomeConvidado, StringComparison.OrdinalIgnoreCase));

            if (convidadoDuplicado)
                throw new Exception("Ja existe um convidado com esse nome nesta partida.");

            var convidado = new Usuario
            {
                Nome = nomeConvidado,
                Email = $"convidado.{Guid.NewGuid():N}@resenha.local",
                SenhaHash = "CONVIDADO",
                Ativo = false,
                Goleiro = false,
                Convidado = true,
                CriadoEm = DateTime.UtcNow
            };

            _context.Usuarios.Add(convidado);
            _context.SaveChanges();

            _context.PresencasPartida.Add(new PresencaPartida
            {
                IdPartida = matchId,
                IdUsuario = convidado.IdUsuario,
                Status = "CONFIRMADO",
                ConfirmadoEm = DateTime.UtcNow
            });

            _context.SaveChanges();
            transaction.Commit();

            SincronizarDesafioPartida(partida, ObterOuCriarDesafioPartida(partida));

            return new PresenceResponseDTO
            {
                IdPartida = matchId,
                Status = "CONFIRMADO",
                TotalConfirmados = _context.PresencasPartida.Count(pr => pr.IdPartida == matchId && pr.Status == "CONFIRMADO"),
                LimiteVagas = partida.LimiteVagas
            };
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

            var guestIds = _context.PresencasPartida
                .Where(p => p.IdPartida == matchId)
                .Join(_context.Usuarios,
                    p => p.IdUsuario,
                    u => u.IdUsuario,
                    (p, u) => new { p.IdUsuario, u.Convidado })
                .Where(x => x.Convidado)
                .Select(x => x.IdUsuario)
                .Distinct()
                .ToList();

            if (partida.IdCicloCapitao.HasValue)
            {
                var ciclo = _context.CiclosCapitao
                    .FirstOrDefault(c => c.IdCiclo == partida.IdCicloCapitao.Value && c.Status == "ATIVO");

                if (ciclo != null)
                    ciclo.IdDesafianteAtual = null;
            }

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

            var desafios = _context.DesafiosPartida.Where(d => d.IdPartida == matchId).ToList();
            if (desafios.Count > 0)
                _context.DesafiosPartida.RemoveRange(desafios);

            var historicos = _context.HistoricosCapitao.Where(h => h.IdPartida == matchId).ToList();
            if (historicos.Count > 0)
                _context.HistoricosCapitao.RemoveRange(historicos);

            _context.Partidas.Remove(partida);

            if (guestIds.Count > 0)
            {
                var guestIdsComOutrasReferencias = _context.PresencasPartida
                    .Where(p => guestIds.Contains(p.IdUsuario) && p.IdPartida != matchId)
                    .Select(p => p.IdUsuario)
                    .Distinct()
                    .ToHashSet();

                var convidadosParaRemover = _context.Usuarios
                    .Where(u => guestIds.Contains(u.IdUsuario) && u.Convidado && !guestIdsComOutrasReferencias.Contains(u.IdUsuario))
                    .ToList();

                if (convidadosParaRemover.Count > 0)
                    _context.Usuarios.RemoveRange(convidadosParaRemover);
            }

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

            if (GetAgoraBrasilia() > partida.DataHoraJogo.AddMinutes(-20))
                throw new Exception("As confirmações ficam abertas somente até 20 minutos antes do jogo.");

            var ehMembro = _context.GrupoUsuarios
                .Any(gu => gu.IdGrupo == partida.IdGrupo && gu.IdUsuario == userId && gu.Ativo);

            if (!ehMembro)
                throw new Exception("Você não é membro deste grupo.");

            var presencaExistente = _context.PresencasPartida
                .FirstOrDefault(pr => pr.IdPartida == matchId && pr.IdUsuario == userId);

            if (presencaExistente != null && presencaExistente.Status == "CONFIRMADO")
                throw new Exception("Você já confirmou presença nesta partida.");

            // Em transação serializável para evitar overbooking em chamadas concorrentes
            var usuario = _context.Usuarios.FirstOrDefault(u => u.IdUsuario == userId);
            if (usuario == null)
                throw new Exception("Usuário não encontrado.");

            var totalConfirmados = _context.PresencasPartida
                .Count(pr => pr.IdPartida == matchId && pr.Status == "CONFIRMADO");

            if (totalConfirmados >= partida.LimiteVagas)
                throw new Exception($"Vagas encerradas. Limite de {partida.LimiteVagas} jogadores atingido.");

            if (usuario.Goleiro)
            {
                var goleirosConfirmados = _context.PresencasPartida
                    .Where(pr => pr.IdPartida == matchId && pr.Status == "CONFIRMADO")
                    .Join(_context.Usuarios,
                        pr => pr.IdUsuario,
                        u => u.IdUsuario,
                        (pr, u) => u.Goleiro)
                    .Count(goleiro => goleiro);

                if (goleirosConfirmados >= 2)
                    throw new Exception("O limite de goleiros confirmados para esta partida ja foi atingido.");
            }

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
            var totalAntes = _context.PresencasPartida.Count(pr => pr.IdPartida == matchId && pr.Status == "CONFIRMADO");
            var nomeUsuario = _context.Usuarios.Where(u => u.IdUsuario == userId).Select(u => u.Nome).FirstOrDefault() ?? "Um jogador";

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
            SincronizarDesafioPartida(partida, ObterOuCriarDesafioPartida(partida));

            var total = _context.PresencasPartida.Count(pr => pr.IdPartida == matchId && pr.Status == "CONFIRMADO");
            if (totalAntes >= partida.LimiteVagas && total < partida.LimiteVagas)
                NotificarVagaReaberta(partida, userId, nomeUsuario);

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
            SincronizarDesafioPartida(partida, ObterOuCriarDesafioPartida(partida));

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
            var totalAntes = _context.PresencasPartida.Count(pr => pr.IdPartida == matchId && pr.Status == "CONFIRMADO");
            var nomeUsuario = _context.Usuarios.Where(u => u.IdUsuario == userId).Select(u => u.Nome).FirstOrDefault() ?? "Um jogador";

            if (presenca == null)
                throw new Exception("Você não possui presença confirmada nesta partida.");

            presenca.Status = "CANCELADO";
            _context.SaveChanges();
            SincronizarDesafioPartida(partida, ObterOuCriarDesafioPartida(partida));

            var total = _context.PresencasPartida
                .Count(pr => pr.IdPartida == matchId && pr.Status == "CONFIRMADO");

            if (totalAntes >= partida.LimiteVagas && total < partida.LimiteVagas)
                NotificarVagaReaberta(partida, userId, nomeUsuario);

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

        private ResumoPartidaHistoricoDTO BuildResumoHistorico(Partida partida)
        {
            var totalConfirmados = _context.PresencasPartida
                .Count(pr => pr.IdPartida == partida.IdPartida && pr.Status == "CONFIRMADO");

            var resultado = _context.ResultadosPartida.FirstOrDefault(r => r.IdPartida == partida.IdPartida);
            var times = _context.TimesPartida.Where(t => t.IdPartida == partida.IdPartida).ToList();
            var time1 = times.FirstOrDefault(t => t.NumeroTime == 1);
            var time2 = times.FirstOrDefault(t => t.NumeroTime == 2);

            var nomeCapitaoTime1 = time1 == null
                ? null
                : _context.Usuarios.Where(u => u.IdUsuario == time1.IdCapitao).Select(u => u.Nome).FirstOrDefault();

            var nomeCapitaoTime2 = time2 == null
                ? null
                : _context.Usuarios.Where(u => u.IdUsuario == time2.IdCapitao).Select(u => u.Nome).FirstOrDefault();

            string? nomeCapitaoVencedor = null;
            if (resultado != null)
            {
                var timeVencedor = times.FirstOrDefault(t => t.NumeroTime == resultado.VencedorNumeroTime);
                if (timeVencedor != null)
                {
                    nomeCapitaoVencedor = _context.Usuarios
                        .Where(u => u.IdUsuario == timeVencedor.IdCapitao)
                        .Select(u => u.Nome)
                        .FirstOrDefault();
                }
            }

            return new ResumoPartidaHistoricoDTO
            {
                IdPartida = partida.IdPartida,
                DataHoraJogo = partida.DataHoraJogo,
                Status = partida.Status,
                LimiteVagas = partida.LimiteVagas,
                TotalConfirmados = totalConfirmados,
                GolsTime1 = resultado?.GolsTime1,
                GolsTime2 = resultado?.GolsTime2,
                NomeCapitaoTime1 = nomeCapitaoTime1,
                NomeCapitaoTime2 = nomeCapitaoTime2,
                NumeroTimeVencedor = resultado?.VencedorNumeroTime,
                NomeCapitaoVencedor = nomeCapitaoVencedor
            };
        }

        private DesafioPartida ObterOuCriarDesafioPartida(Partida partida)
        {
            var desafio = _context.DesafiosPartida.FirstOrDefault(d => d.IdPartida == partida.IdPartida);
            if (desafio != null)
                return desafio;

            var ciclo = ObterCicloDaPartida(partida);
            desafio = new DesafioPartida
            {
                IdPartida = partida.IdPartida,
                IdCapitaoAtual = ciclo?.IdCapitaoAtual,
                IdDesafiante = ciclo?.IdDesafianteAtual,
                AtualizadoEm = DateTime.UtcNow
            };

            _context.DesafiosPartida.Add(desafio);
            _context.SaveChanges();
            return desafio;
        }

        private void SincronizarDesafioPartida(Partida partida, DesafioPartida desafio)
        {
            var ciclo = ObterCicloDaPartida(partida);
            desafio.IdCapitaoAtual = ciclo?.IdCapitaoAtual;
            desafio.IdDesafiante = ciclo?.IdDesafianteAtual;
            desafio.StatusFluxo = CalcularStatusFluxoAtual(partida, desafio);
            AjustarFluxoParaNovosJogadoresLinha(partida, desafio);
            desafio.AtualizadoEm = DateTime.UtcNow;
            _context.SaveChanges();
        }

        private string CalcularStatusFluxoAtual(Partida partida, DesafioPartida desafio)
        {
            if (partida.Status == "FINALIZADA")
                return "TIMES_FECHADOS";

            var totalConfirmados = _context.PresencasPartida
                .Count(pr => pr.IdPartida == partida.IdPartida && pr.Status == "CONFIRMADO");

            var goleirosConfirmados = _context.PresencasPartida
                .Where(pr => pr.IdPartida == partida.IdPartida && pr.Status == "CONFIRMADO")
                .Join(_context.Usuarios,
                    pr => pr.IdUsuario,
                    u => u.IdUsuario,
                    (pr, u) => u.Goleiro)
                .Count(goleiro => goleiro);

            if (totalConfirmados < 12 || goleirosConfirmados == 0)
                return "AGUARDANDO_CONFIRMACOES";

            var estadosAvancados = new HashSet<string>
            {
                "PAR_IMPAR_LINHA",
                "ESCOLHA_EM_ANDAMENTO",
                "PAR_IMPAR_GOLEIROS",
                "ESCOLHA_GOLEIRO_EM_ANDAMENTO",
                "DEFINICAO_MANUAL_GOLEIRO",
                "TIMES_FECHADOS"
            };

            if (estadosAvancados.Contains(desafio.StatusFluxo))
                return desafio.StatusFluxo;

            return "PRONTA_PARA_MONTAGEM";
        }

        private void AjustarFluxoParaNovosJogadoresLinha(Partida partida, DesafioPartida desafio)
        {
            if (!desafio.IdCapitaoAtual.HasValue || !desafio.IdDesafiante.HasValue)
                return;

            var jogadoresLinhaDisponiveis = ListarJogadoresLinhaDisponiveis(partida, desafio);
            if (jogadoresLinhaDisponiveis.Count == 0)
                return;

            var statusQueDevemRetomarEscolha = new HashSet<string>
            {
                "PAR_IMPAR_GOLEIROS",
                "ESCOLHA_GOLEIRO_EM_ANDAMENTO",
                "DEFINICAO_MANUAL_GOLEIRO",
                "TIMES_FECHADOS"
            };

            if (!statusQueDevemRetomarEscolha.Contains(desafio.StatusFluxo))
                return;

            desafio.StatusFluxo = "ESCOLHA_EM_ANDAMENTO";
            desafio.IdProximoCapitaoEscolha = DeterminarProximoCapitaoParaJogadoresLinha(partida, desafio);
        }

        private ulong DeterminarProximoCapitaoParaJogadoresLinha(Partida partida, DesafioPartida desafio)
        {
            if (!desafio.IdCapitaoAtual.HasValue || !desafio.IdDesafiante.HasValue)
                throw new Exception("Os capitães da partida não estão definidos.");

            var timeCapitaoAtual = ObterTimePorCapitao(partida.IdPartida, desafio.IdCapitaoAtual.Value);
            var timeDesafiante = ObterTimePorCapitao(partida.IdPartida, desafio.IdDesafiante.Value);

            if (timeCapitaoAtual == null || timeDesafiante == null)
                return desafio.IdProximoCapitaoEscolha
                    ?? desafio.IdVencedorParImparLinha
                    ?? desafio.IdCapitaoAtual.Value;

            var quantidadeLinhaCapitaoAtual = _context.JogadoresTimePartida
                .Where(j => j.IdTime == timeCapitaoAtual.IdTime)
                .Join(_context.Usuarios,
                    j => j.IdUsuario,
                    u => u.IdUsuario,
                    (j, u) => u.Goleiro)
                .Count(goleiro => !goleiro);

            var quantidadeLinhaDesafiante = _context.JogadoresTimePartida
                .Where(j => j.IdTime == timeDesafiante.IdTime)
                .Join(_context.Usuarios,
                    j => j.IdUsuario,
                    u => u.IdUsuario,
                    (j, u) => u.Goleiro)
                .Count(goleiro => !goleiro);

            if (quantidadeLinhaCapitaoAtual < quantidadeLinhaDesafiante)
                return desafio.IdCapitaoAtual.Value;

            if (quantidadeLinhaDesafiante < quantidadeLinhaCapitaoAtual)
                return desafio.IdDesafiante.Value;

            return desafio.IdProximoCapitaoEscolha
                ?? desafio.IdVencedorParImparLinha
                ?? desafio.IdCapitaoAtual.Value;
        }

        private CicloCapitao? ObterCicloDaPartida(Partida partida)
        {
            if (partida.IdCicloCapitao.HasValue)
            {
                return _context.CiclosCapitao.FirstOrDefault(c => c.IdCiclo == partida.IdCicloCapitao.Value);
            }

            return _context.CiclosCapitao
                .Where(c => c.IdGrupo == partida.IdGrupo && c.Status == "ATIVO")
                .OrderByDescending(c => c.IniciadoEm)
                .FirstOrDefault();
        }

        private static DateTime GetAgoraBrasilia()
        {
            TimeZoneInfo timezone;

            try
            {
                timezone = TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo");
            }
            catch (TimeZoneNotFoundException)
            {
                timezone = TimeZoneInfo.FindSystemTimeZoneById("E. South America Standard Time");
            }

            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timezone);
        }

        private static string? ObterParidadeOposta(string? escolhaCapitaoAtual)
        {
            return escolhaCapitaoAtual?.ToUpperInvariant() switch
            {
                "PAR" => "IMPAR",
                "IMPAR" => "PAR",
                _ => null
            };
        }

        private static string FormatarNomeExibicao(string nome, bool convidado)
        {
            return convidado ? $"{nome} (Convidado)" : nome;
        }

        private void NotificarVagaReaberta(Partida partida, ulong idUsuarioQueSaiu, string nomeUsuarioQueSaiu)
        {
            var destinatarios = _context.GrupoUsuarios
                .Where(gu => gu.IdGrupo == partida.IdGrupo && gu.Ativo && gu.IdUsuario != idUsuarioQueSaiu)
                .Join(_context.Usuarios,
                    gu => gu.IdUsuario,
                    u => u.IdUsuario,
                    (gu, u) => new { u.Email, u.Nome, u.Convidado, u.Ativo })
                .ToList()
                .Where(x => x.Ativo && !x.Convidado)
                .Where(x => !string.IsNullOrWhiteSpace(x.Email))
                .Where(x => !x.Email.EndsWith("@resenha.local", StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (destinatarios.Count == 0)
                return;

            var nomeGrupo = _context.Grupos
                .Where(g => g.IdGrupo == partida.IdGrupo)
                .Select(g => g.Nome)
                .FirstOrDefault() ?? "Resenha";

            foreach (var destinatario in destinatarios)
            {
                try
                {
                    _inviteEmailService.SendMatchSlotReopened(
                        destinatario.Email,
                        destinatario.Nome,
                        nomeGrupo,
                        nomeUsuarioQueSaiu,
                        partida.DataHoraJogo);
                }
                catch
                {
                    // Melhor esforço: a vaga nao deve deixar de reabrir por falha no envio de e-mail.
                }
            }
        }

        private void GarantirTimesDesafio(Partida partida, DesafioPartida desafio)
        {
            if (!desafio.IdCapitaoAtual.HasValue || !desafio.IdDesafiante.HasValue)
                return;

            var timeCapitaoAtual = ObterTimePorCapitao(partida.IdPartida, desafio.IdCapitaoAtual.Value);
            if (timeCapitaoAtual == null)
            {
                timeCapitaoAtual = new TimePartida
                {
                    IdPartida = partida.IdPartida,
                    NumeroTime = 1,
                    IdCapitao = desafio.IdCapitaoAtual.Value
                };
                _context.TimesPartida.Add(timeCapitaoAtual);
                _context.SaveChanges();
            }

            var timeDesafiante = ObterTimePorCapitao(partida.IdPartida, desafio.IdDesafiante.Value);
            if (timeDesafiante == null)
            {
                timeDesafiante = new TimePartida
                {
                    IdPartida = partida.IdPartida,
                    NumeroTime = 2,
                    IdCapitao = desafio.IdDesafiante.Value
                };
                _context.TimesPartida.Add(timeDesafiante);
                _context.SaveChanges();
            }

            GarantirJogadorNoTime(timeCapitaoAtual.IdTime, desafio.IdCapitaoAtual.Value);
            GarantirJogadorNoTime(timeDesafiante.IdTime, desafio.IdDesafiante.Value);
        }

        private void GarantirJogadorNoTime(ulong idTime, ulong idUsuario)
        {
            var jaExiste = _context.JogadoresTimePartida.Any(j => j.IdTime == idTime && j.IdUsuario == idUsuario);
            if (jaExiste)
                return;

            _context.JogadoresTimePartida.Add(new JogadorTimePartida
            {
                IdTime = idTime,
                IdUsuario = idUsuario
            });
            _context.SaveChanges();
        }

        private TimePartida? ObterTimePorCapitao(ulong idPartida, ulong idCapitao)
        {
            return _context.TimesPartida.FirstOrDefault(t => t.IdPartida == idPartida && t.IdCapitao == idCapitao);
        }

        private List<JogadorDisponivelDesafioDTO> ListarJogadoresLinhaDisponiveis(
            Partida partida,
            DesafioPartida desafio)
        {
            var confirmados = _context.PresencasPartida
                .Where(pr => pr.IdPartida == partida.IdPartida && pr.Status == "CONFIRMADO")
                .Join(_context.Usuarios,
                    pr => pr.IdUsuario,
                    u => u.IdUsuario,
                    (pr, u) => new { u.IdUsuario, u.Nome, u.Convidado, u.Goleiro })
                .ToList();

            var idsJaEscolhidos = _context.TimesPartida
                .Where(t => t.IdPartida == partida.IdPartida)
                .Join(_context.JogadoresTimePartida,
                    t => t.IdTime,
                    j => j.IdTime,
                    (t, j) => j.IdUsuario)
                .ToHashSet();

            return confirmados
                .Where(c => !c.Goleiro)
                .Where(c => c.IdUsuario != desafio.IdCapitaoAtual && c.IdUsuario != desafio.IdDesafiante)
                .Where(c => !idsJaEscolhidos.Contains(c.IdUsuario))
                .OrderBy(c => c.Nome)
                .Select(c => new JogadorDisponivelDesafioDTO
                {
                    IdUsuario = c.IdUsuario,
                    Nome = FormatarNomeExibicao(c.Nome, c.Convidado),
                    Goleiro = c.Goleiro
                })
                .ToList();
        }

        private List<JogadorDisponivelDesafioDTO> ListarGoleirosDisponiveis(
            Partida partida,
            DesafioPartida desafio)
        {
            var confirmados = _context.PresencasPartida
                .Where(pr => pr.IdPartida == partida.IdPartida && pr.Status == "CONFIRMADO")
                .Join(_context.Usuarios,
                    pr => pr.IdUsuario,
                    u => u.IdUsuario,
                    (pr, u) => new { u.IdUsuario, u.Nome, u.Convidado, u.Goleiro })
                .ToList();

            var idsJaEscolhidos = _context.TimesPartida
                .Where(t => t.IdPartida == partida.IdPartida)
                .Join(_context.JogadoresTimePartida,
                    t => t.IdTime,
                    j => j.IdTime,
                    (t, j) => j.IdUsuario)
                .ToHashSet();

            return confirmados
                .Where(c => c.Goleiro)
                .Where(c => c.IdUsuario != desafio.IdCapitaoAtual && c.IdUsuario != desafio.IdDesafiante)
                .Where(c => !idsJaEscolhidos.Contains(c.IdUsuario))
                .OrderBy(c => c.Nome)
                .Select(c => new JogadorDisponivelDesafioDTO
                {
                    IdUsuario = c.IdUsuario,
                    Nome = FormatarNomeExibicao(c.Nome, c.Convidado),
                    Goleiro = c.Goleiro
                })
                .ToList();
        }

        private TimeMontagemDesafioDTO? BuildTimeMontagemDTO(ulong idPartida, ulong? idCapitao)
        {
            if (!idCapitao.HasValue)
                return null;

            var time = _context.TimesPartida.FirstOrDefault(t => t.IdPartida == idPartida && t.IdCapitao == idCapitao.Value);
            if (time == null)
                return null;

            var jogadores = _context.JogadoresTimePartida
                .Where(j => j.IdTime == time.IdTime)
                .Join(_context.Usuarios,
                    j => j.IdUsuario,
                    u => u.IdUsuario,
                    (j, u) => new { u.IdUsuario, u.Nome, u.Convidado, u.Goleiro })
                .ToList()
                .Select(u => new JogadorDisponivelDesafioDTO
                {
                    IdUsuario = u.IdUsuario,
                    Nome = FormatarNomeExibicao(u.Nome, u.Convidado),
                    Goleiro = u.Goleiro
                })
                .OrderBy(j => j.IdUsuario == idCapitao.Value ? 0 : 1)
                .ThenBy(j => j.Nome)
                .ToList();

            var nomeCapitao = jogadores.FirstOrDefault(j => j.IdUsuario == idCapitao.Value)?.Nome
                ?? _context.Usuarios
                    .Where(u => u.IdUsuario == idCapitao.Value)
                    .Select(u => new { u.Nome, u.Convidado })
                    .ToList()
                    .Select(u => FormatarNomeExibicao(u.Nome, u.Convidado))
                    .FirstOrDefault()
                ?? "Capitao";

            return new TimeMontagemDesafioDTO
            {
                NumeroTime = time.NumeroTime,
                IdCapitao = idCapitao.Value,
                NomeCapitao = nomeCapitao,
                Jogadores = jogadores
            };
        }

        private CapitaoDesafioDTO BuildCapitaoDTO(ulong idUsuario)
        {
            var usuario = _context.Usuarios.First(u => u.IdUsuario == idUsuario);
            return new CapitaoDesafioDTO
            {
                IdUsuario = usuario.IdUsuario,
                Nome = usuario.Convidado ? $"{usuario.Nome} (Convidado)" : usuario.Nome
            };
        }

        private void ValidarMembroAtivoNoGrupo(ulong userId, ulong groupId)
        {
            var ehMembro = _context.GrupoUsuarios
                .Any(gu => gu.IdGrupo == groupId && gu.IdUsuario == userId && gu.Ativo);

            if (!ehMembro)
                throw new Exception("Você não é membro deste grupo.");
        }
    }
}

