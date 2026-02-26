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

        // Admin sorteia o capitão inicial do grupo na temporada ativa
        public CaptainStatusDTO DrawCaptain(ulong adminId, ulong groupId)
        {
            ValidarAdmin(adminId, groupId);

            // Só pode sortear se não houver ciclo ATIVO
            var cicloAtivo = _context.CiclosCapitao
                .FirstOrDefault(c => c.IdGrupo == groupId && c.Status == "ATIVO");

            if (cicloAtivo != null)
                throw new Exception("Já existe um capitão ativo neste grupo. Encerre o ciclo atual antes de sortear.");

            var temporada = _context.Temporadas
                .FirstOrDefault(t => t.IdGrupo == groupId && t.Status == "ATIVA");

            if (temporada == null)
                throw new Exception("Não há temporada ativa neste grupo. Crie uma partida primeiro para ativar a temporada.");

            // Sorteia aleatoriamente entre os membros ativos do grupo
            var membros = _context.GrupoUsuarios
                .Where(gu => gu.IdGrupo == groupId && gu.Ativo)
                .ToList();

            if (membros.Count < 2)
                throw new Exception("O grupo precisa ter pelo menos 2 membros para sortear o capitão.");

            var sorteado = membros[new Random().Next(membros.Count)];

            var ciclo = new CicloCapitao
            {
                IdGrupo = groupId,
                IdTemporada = temporada.IdTemporada,
                IdCapitaoAtual = sorteado.IdUsuario
            };

            _context.CiclosCapitao.Add(ciclo);
            _context.SaveChanges();

            return GetStatus(groupId);
        }

        // Retorna o status atual do capitão no grupo
        public CaptainStatusDTO GetStatus(ulong groupId)
        {
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

        // Membro não-bloqueado desafia o capitão atual
        public CaptainStatusDTO Challenge(ulong userId, ulong groupId)
        {
            var ciclo = _context.CiclosCapitao
                .FirstOrDefault(c => c.IdGrupo == groupId && c.Status == "ATIVO");

            if (ciclo == null)
                throw new Exception("Não há capitão ativo neste grupo.");

            // Verifica se é membro do grupo
            var ehMembro = _context.GrupoUsuarios
                .Any(gu => gu.IdGrupo == groupId && gu.IdUsuario == userId && gu.Ativo);

            if (!ehMembro)
                throw new Exception("Você não é membro deste grupo.");

            if (userId == ciclo.IdCapitaoAtual)
                throw new Exception("O capitão não pode desafiar a si mesmo.");

            // Verifica se já há desafio pendente
            if (ciclo.IdDesafianteAtual.HasValue)
                throw new Exception("Já existe um desafio pendente. Aguarde o administrador registrar o resultado.");

            // Verifica se o jogador está bloqueado neste ciclo
            var estaBloqueado = _context.CiclosCapitaoBloqueados
                .Any(b => b.IdCiclo == ciclo.IdCiclo && b.IdUsuarioBloqueado == userId);

            if (estaBloqueado)
                throw new Exception("Você já foi derrotado pelo capitão neste ciclo e não pode desafiar novamente.");

            ciclo.IdDesafianteAtual = userId;
            _context.SaveChanges();

            return GetStatus(groupId);
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

            return GetStatus(groupId);
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
    }
}
