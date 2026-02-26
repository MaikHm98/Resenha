using Microsoft.EntityFrameworkCore;
using Resenha.API.Data;
using Resenha.API.DTOs.Groups;
using Resenha.API.Entities;

namespace Resenha.API.Services
{
    public class GroupService
    {
        private readonly ResenhaDbContext _context;

        public GroupService(ResenhaDbContext context)
        {
            _context = context;
        }

        // Cria um novo grupo e adiciona o criador como ADMIN
        public GroupResponseDTO CreateGroup(ulong userId, CreateGroupDTO dto)
        {
            var grupo = new Grupo
            {
                Nome = dto.Nome,
                Descricao = dto.Descricao,
                LimiteJogadores = dto.LimiteJogadores,
                CriadoPorUsuario = userId
            };

            _context.Grupos.Add(grupo);
            _context.SaveChanges();

            var membro = new GrupoUsuario
            {
                IdGrupo = grupo.IdGrupo,
                IdUsuario = userId,
                Perfil = "ADMIN"
            };

            _context.GrupoUsuarios.Add(membro);
            _context.SaveChanges();

            return new GroupResponseDTO
            {
                IdGrupo = grupo.IdGrupo,
                Nome = grupo.Nome,
                Descricao = grupo.Descricao,
                LimiteJogadores = grupo.LimiteJogadores,
                Perfil = "ADMIN",
                TotalMembros = 1,
                CriadoEm = grupo.CriadoEm
            };
        }

        // Lista todos os grupos em que o usuário é membro ativo
        public List<GroupResponseDTO> GetMyGroups(ulong userId)
        {
            var grupos = _context.GrupoUsuarios
                .Where(gu => gu.IdUsuario == userId && gu.Ativo)
                .Join(_context.Grupos,
                    gu => gu.IdGrupo,
                    g => g.IdGrupo,
                    (gu, g) => new { Membro = gu, Grupo = g })
                .Where(x => x.Grupo.Ativo)
                .ToList();

            var result = grupos.Select(x => new GroupResponseDTO
            {
                IdGrupo = x.Grupo.IdGrupo,
                Nome = x.Grupo.Nome,
                Descricao = x.Grupo.Descricao,
                LimiteJogadores = x.Grupo.LimiteJogadores,
                Perfil = x.Membro.Perfil,
                TotalMembros = _context.GrupoUsuarios.Count(gu => gu.IdGrupo == x.Grupo.IdGrupo && gu.Ativo),
                CriadoEm = x.Grupo.CriadoEm
            }).ToList();

            return result;
        }

        // Admin gera um convite com código único para um email (válido 7 dias)
        public InviteResponseDTO InviteUser(ulong adminUserId, ulong groupId, InviteUserDTO dto)
        {
            // Verifica se o solicitante é admin do grupo
            var membro = _context.GrupoUsuarios
                .FirstOrDefault(gu => gu.IdGrupo == groupId && gu.IdUsuario == adminUserId && gu.Ativo);

            if (membro == null)
                throw new Exception("Você não é membro deste grupo.");

            if (membro.Perfil != "ADMIN")
                throw new Exception("Apenas administradores podem convidar jogadores.");

            // Verifica se o email já está no grupo
            var usuarioConvidado = _context.Usuarios
                .FirstOrDefault(u => u.Email == dto.EmailConvidado && u.Ativo);

            if (usuarioConvidado != null)
            {
                var jaEhMembro = _context.GrupoUsuarios
                    .Any(gu => gu.IdGrupo == groupId && gu.IdUsuario == usuarioConvidado.IdUsuario && gu.Ativo);

                if (jaEhMembro)
                    throw new Exception("Este usuário já é membro do grupo.");
            }

            // Cancela convites pendentes anteriores para o mesmo email/grupo
            var convitesPendentes = _context.ConvitesGrupo
                .Where(c => c.IdGrupo == groupId && c.EmailConvidado == dto.EmailConvidado && c.Status == "PENDENTE")
                .ToList();

            foreach (var c in convitesPendentes)
                c.Status = "CANCELADO";

            // Gera código único de 8 caracteres
            var codigo = GerarCodigoUnico();

            var convite = new ConviteGrupo
            {
                IdGrupo = groupId,
                EmailConvidado = dto.EmailConvidado,
                CodigoConvite = codigo,
                CriadoPorUsuario = adminUserId,
                ExpiraEm = DateTime.UtcNow.AddDays(7)
            };

            _context.ConvitesGrupo.Add(convite);
            _context.SaveChanges();

            return new InviteResponseDTO
            {
                CodigoConvite = codigo,
                EmailConvidado = dto.EmailConvidado,
                ExpiraEm = convite.ExpiraEm
            };
        }

        // Usuário entra no grupo usando o código de convite
        public GroupResponseDTO JoinGroup(ulong userId, JoinGroupDTO dto)
        {
            var usuario = _context.Usuarios.FirstOrDefault(u => u.IdUsuario == userId);
            if (usuario == null)
                throw new Exception("Usuário não encontrado.");

            var convite = _context.ConvitesGrupo
                .FirstOrDefault(c => c.CodigoConvite == dto.CodigoConvite);

            if (convite == null)
                throw new Exception("Código de convite inválido.");

            if (convite.Status != "PENDENTE")
                throw new Exception("Este convite já foi utilizado ou cancelado.");

            if (convite.ExpiraEm < DateTime.UtcNow)
            {
                convite.Status = "EXPIRADO";
                _context.SaveChanges();
                throw new Exception("Este convite expirou.");
            }

            if (convite.EmailConvidado != usuario.Email)
                throw new Exception("Este convite não pertence ao seu email.");

            // Verifica se já é membro
            var jaEhMembro = _context.GrupoUsuarios
                .Any(gu => gu.IdGrupo == convite.IdGrupo && gu.IdUsuario == userId && gu.Ativo);

            if (jaEhMembro)
                throw new Exception("Você já é membro deste grupo.");

            // Adiciona o usuário ao grupo como JOGADOR
            var membro = new GrupoUsuario
            {
                IdGrupo = convite.IdGrupo,
                IdUsuario = userId,
                Perfil = "JOGADOR"
            };

            _context.GrupoUsuarios.Add(membro);

            // Marca convite como aceito
            convite.Status = "ACEITO";

            _context.SaveChanges();

            var grupo = _context.Grupos.First(g => g.IdGrupo == convite.IdGrupo);

            return new GroupResponseDTO
            {
                IdGrupo = grupo.IdGrupo,
                Nome = grupo.Nome,
                Descricao = grupo.Descricao,
                LimiteJogadores = grupo.LimiteJogadores,
                Perfil = "JOGADOR",
                TotalMembros = _context.GrupoUsuarios.Count(gu => gu.IdGrupo == grupo.IdGrupo && gu.Ativo),
                CriadoEm = grupo.CriadoEm
            };
        }

        // Gera código alfanumérico de 8 caracteres garantidamente único
        private string GerarCodigoUnico()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var rng = new Random();
            string codigo;

            do
            {
                codigo = new string(Enumerable.Repeat(chars, 8)
                    .Select(s => s[rng.Next(s.Length)]).ToArray());
            }
            while (_context.ConvitesGrupo.Any(c => c.CodigoConvite == codigo));

            return codigo;
        }
    }
}
