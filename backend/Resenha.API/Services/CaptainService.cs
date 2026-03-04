using Resenha.API.Data;
using Resenha.API.DTOs.Captain;
using Resenha.API.Entities;

namespace Resenha.API.Services
{
    public class CaptainService
    {
        private readonly ResenhaDbContext _context;

        public CaptainService(ResenhaDbContext context)
        {
            _context = context;
        }

        // Admin inicia o ciclo de capitão — admin vira Capitão 1 automaticamente
        public CaptainStatusDTO DrawCaptain(ulong adminId, ulong groupId)
        {
            ValidarAdmin(adminId, groupId);

            // Só pode iniciar se não houver ciclo ATIVO
            var cicloAtivo = _context.CiclosCapitao
                .FirstOrDefault(c => c.IdGrupo == groupId && c.Status == "ATIVO");

            if (cicloAtivo != null)
                throw new Exception("Já existe um capitão ativo neste grupo. Registre o resultado do desafio atual antes de iniciar um novo ciclo.");

            var temporada = _context.Temporadas
                .FirstOrDefault(t => t.IdGrupo == groupId && t.Status == "ATIVA");

            if (temporada == null)
                throw new Exception("Não há temporada ativa neste grupo. Crie uma partida primeiro para ativar a temporada.");

            // Admin passa a ser o Capitão 1 automaticamente
            var ciclo = new CicloCapitao
            {
                IdGrupo = groupId,
                IdTemporada = temporada.IdTemporada,
                IdCapitaoAtual = adminId
            };

            _context.CiclosCapitao.Add(ciclo);
            _context.SaveChanges();

            return GetStatus(adminId, groupId);
        }

        // Retorna o status atual do capitão no grupo
        public CaptainStatusDTO GetStatus(ulong userId, ulong groupId)
        {
            ValidarMembro(userId, groupId);

            var ciclo = _context.CiclosCapitao
                .FirstOrDefault(c => c.IdGrupo == groupId && c.Status == "ATIVO");

            if (ciclo == null)
                throw new Exception("Não há capitão ativo neste grupo.");

            var capitao = _context.Usuarios.First(u => u.IdUsuario == ciclo.IdCapitaoAtual);

            string? nomeDesafiante = null;
            if (ciclo.IdDesafianteAtual.HasValue)
            {
                var desafiante = _context.Usuarios.FirstOrDefault(u => u.IdUsuario == ciclo.IdDesafianteAtual.Value);
                nomeDesafiante = desafiante?.Nome;
            }

            var bloqueados = _context.CiclosCapitaoBloqueados
                .Where(b => b.IdCiclo == ciclo.IdCiclo)
                .Join(_context.Usuarios,
                    b => b.IdUsuarioBloqueado,
                    u => u.IdUsuario,
                    (b, u) => new BlockedPlayerDTO
                    {
                        IdUsuario = u.IdUsuario,
                        Nome = u.Nome
                    })
                .ToList();

            return new CaptainStatusDTO
            {
                IdCiclo = ciclo.IdCiclo,
                IdCapitao = ciclo.IdCapitaoAtual,
                NomeCapitao = capitao.Nome,
                IdDesafiante = ciclo.IdDesafianteAtual,
                NomeDesafiante = nomeDesafiante,
                Bloqueados = bloqueados,
                Status = ciclo.Status,
                IniciadoEm = ciclo.IniciadoEm
            };
        }

        // Capitão lança desafio escolhendo um jogador confirmado como Capitão 2
        public CaptainStatusDTO Challenge(ulong capitaoId, ulong groupId, LaunchChallengeDTO dto)
        {
            var ciclo = _context.CiclosCapitao
                .FirstOrDefault(c => c.IdGrupo == groupId && c.Status == "ATIVO");

            if (ciclo == null)
                throw new Exception("Não há capitão ativo neste grupo.");

            // Somente o capitão atual pode lançar o desafio
            if (capitaoId != ciclo.IdCapitaoAtual)
                throw new Exception("Apenas o capitão atual pode escolher o desafiante.");

            // Verifica se já há desafio pendente
            if (ciclo.IdDesafianteAtual.HasValue)
                throw new Exception("Já existe um desafio pendente. Registre o resultado antes de lançar outro.");

            // Desafiante não pode ser o próprio capitão
            if (dto.IdDesafiante == capitaoId)
                throw new Exception("O capitão não pode desafiar a si mesmo.");

            // Busca a partida e verifica se pertence ao grupo
            var partida = _context.Partidas
                .FirstOrDefault(p => p.IdPartida == dto.IdPartida && p.IdGrupo == groupId);

            if (partida == null)
                throw new Exception("Partida não encontrada neste grupo.");

            // Conta confirmados na partida
            var totalConfirmados = _context.PresencasPartida
                .Count(p => p.IdPartida == dto.IdPartida && p.Status == "CONFIRMADO");

            if (totalConfirmados < 12)
                throw new Exception($"São necessários pelo menos 12 confirmados para lançar o desafio. Atualmente há {totalConfirmados}.");

            // Verifica se o desafiante está confirmado na partida
            var desafianteConfirmado = _context.PresencasPartida
                .Any(p => p.IdPartida == dto.IdPartida && p.IdUsuario == dto.IdDesafiante && p.Status == "CONFIRMADO");

            if (!desafianteConfirmado)
                throw new Exception("O desafiante escolhido não está confirmado nesta partida.");

            // Verifica se o desafiante está bloqueado neste ciclo
            var estaBloqueado = _context.CiclosCapitaoBloqueados
                .Any(b => b.IdCiclo == ciclo.IdCiclo && b.IdUsuarioBloqueado == dto.IdDesafiante);

            if (estaBloqueado)
                throw new Exception("Este jogador já foi derrotado pelo capitão neste ciclo e não pode ser desafiante novamente.");

            ciclo.IdDesafianteAtual = dto.IdDesafiante;
            _context.SaveChanges();

            return GetStatus(capitaoId, groupId);
        }

        // Retorna lista de jogadores elegíveis para serem Capitão 2
        // (confirmados na partida, excluindo capitão e bloqueados)
        public List<BlockedPlayerDTO> GetEligibleChallengers(ulong userId, ulong groupId, ulong matchId)
        {
            ValidarMembro(userId, groupId);

            var ciclo = _context.CiclosCapitao
                .FirstOrDefault(c => c.IdGrupo == groupId && c.Status == "ATIVO");

            if (ciclo == null)
                throw new Exception("Não há capitão ativo neste grupo.");

            var partida = _context.Partidas
                .FirstOrDefault(p => p.IdPartida == matchId && p.IdGrupo == groupId);

            if (partida == null)
                throw new Exception("Partida não encontrada neste grupo.");

            var bloqueadosIds = _context.CiclosCapitaoBloqueados
                .Where(b => b.IdCiclo == ciclo.IdCiclo)
                .Select(b => b.IdUsuarioBloqueado)
                .ToHashSet();

            var elegiveis = _context.PresencasPartida
                .Where(p => p.IdPartida == matchId && p.Status == "CONFIRMADO"
                            && p.IdUsuario != ciclo.IdCapitaoAtual
                            && !bloqueadosIds.Contains(p.IdUsuario))
                .Join(_context.Usuarios,
                    p => p.IdUsuario,
                    u => u.IdUsuario,
                    (p, u) => new BlockedPlayerDTO
                    {
                        IdUsuario = u.IdUsuario,
                        Nome = u.Nome
                    })
                .ToList();

            return elegiveis;
        }

        // Admin registra o resultado do desafio pendente
        public CaptainStatusDTO RegisterResult(ulong adminId, ulong groupId, ChallengeResultDTO dto)
        {
            ValidarAdmin(adminId, groupId);

            if (dto.Resultado != "CAPITAO" && dto.Resultado != "DESAFIANTE")
                throw new Exception("Resultado inválido. Use 'CAPITAO' ou 'DESAFIANTE'.");

            var ciclo = _context.CiclosCapitao
                .FirstOrDefault(c => c.IdGrupo == groupId && c.Status == "ATIVO");

            if (ciclo == null)
                throw new Exception("Não há capitão ativo neste grupo.");

            if (!ciclo.IdDesafianteAtual.HasValue)
                throw new Exception("Não há desafio pendente para registrar resultado.");

            var idDesafiante = ciclo.IdDesafianteAtual.Value;

            if (dto.Resultado == "CAPITAO")
            {
                // Capitão venceu: bloqueia o desafiante e limpa o desafio pendente
                _context.CiclosCapitaoBloqueados.Add(new CicloCapitaoBloqueado
                {
                    IdCiclo = ciclo.IdCiclo,
                    IdUsuarioBloqueado = idDesafiante
                });

                ciclo.IdDesafianteAtual = null;
                _context.SaveChanges();
            }
            else
            {
                // Desafiante venceu: encerra ciclo atual e cria novo ciclo com desafiante como capitão
                ciclo.Status = "ENCERRADO";
                ciclo.EncerradoEm = DateTime.UtcNow;
                _context.SaveChanges();

                var novoCiclo = new CicloCapitao
                {
                    IdGrupo = groupId,
                    IdTemporada = ciclo.IdTemporada,
                    IdCapitaoAtual = idDesafiante
                };

                _context.CiclosCapitao.Add(novoCiclo);
                _context.SaveChanges();
            }

            return GetStatus(adminId, groupId);
        }

        // Auxiliar: valida se o usuário é ADMIN do grupo
        private void ValidarAdmin(ulong userId, ulong groupId)
        {
            var membro = _context.GrupoUsuarios
                .FirstOrDefault(gu => gu.IdGrupo == groupId && gu.IdUsuario == userId && gu.Ativo);

            if (membro == null)
                throw new Exception("Você não é membro deste grupo.");

            if (membro.Perfil != "ADMIN")
                throw new Exception("Apenas administradores podem executar esta ação.");
        }

        private void ValidarMembro(ulong userId, ulong groupId)
        {
            var ehMembro = _context.GrupoUsuarios
                .Any(gu => gu.IdGrupo == groupId && gu.IdUsuario == userId && gu.Ativo);

            if (!ehMembro)
                throw new Exception("Você não é membro deste grupo.");
        }
    }
}
