using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Resenha.API.Data;
using Resenha.API.DTOs.Groups;
using Resenha.API.Entities;
using Resenha.API.Helpers;

namespace Resenha.API.Services
{
    public class GroupService
    {
        private readonly ResenhaDbContext _context;
        private readonly ILogger<GroupService> _logger;
        private readonly IInviteEmailService _inviteEmailService;
        private readonly IConfiguration _configuration;

        public GroupService(
            ResenhaDbContext context,
            ILogger<GroupService> logger,
            IInviteEmailService inviteEmailService,
            IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _inviteEmailService = inviteEmailService;
            _configuration = configuration;
        }

        // Cria um novo grupo e adiciona o criador como ADMIN
        public GroupResponseDTO CreateGroup(ulong userId, CreateGroupDTO dto)
        {
            var grupo = new Grupo
            {
                Nome = dto.Nome,
                Descricao = dto.Descricao,
                LimiteJogadores = dto.LimiteJogadores,
                CriadoPorUsuario = userId,
                DiaSemana = dto.DiaSemana,
                HorarioFixo = dto.HorarioFixo
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
                CriadoEm = grupo.CriadoEm,
                DiaSemana = grupo.DiaSemana,
                HorarioFixo = grupo.HorarioFixo
            };
        }

        // Lista todos os grupos em que o usuÃ¡rio Ã© membro ativo
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
                CriadoEm = x.Grupo.CriadoEm,
                DiaSemana = x.Grupo.DiaSemana,
                HorarioFixo = x.Grupo.HorarioFixo
            }).ToList();

            return result;
        }

        // Admin gera um convite com cÃ³digo Ãºnico para um email (vÃ¡lido 7 dias)
        public InviteResponseDTO InviteUser(ulong adminUserId, ulong groupId, InviteUserDTO dto)
        {
            // Verifica se o solicitante Ã© admin do grupo
            var membro = _context.GrupoUsuarios
                .FirstOrDefault(gu => gu.IdGrupo == groupId && gu.IdUsuario == adminUserId && gu.Ativo);

            if (membro == null)
                throw new Exception("VocÃª nÃ£o Ã© membro deste grupo.");

            if (membro.Perfil != "ADMIN")
                throw new Exception("Apenas administradores podem convidar jogadores.");

            // Verifica se o email jÃ¡ estÃ¡ no grupo
            var usuarioConvidado = _context.Usuarios
                .FirstOrDefault(u => u.Email == dto.EmailConvidado && u.Ativo);

            if (usuarioConvidado != null)
            {
                var jaEhMembro = _context.GrupoUsuarios
                    .Any(gu => gu.IdGrupo == groupId && gu.IdUsuario == usuarioConvidado.IdUsuario && gu.Ativo);

                if (jaEhMembro)
                    throw new Exception("Este usuÃ¡rio jÃ¡ Ã© membro do grupo.");
            }

            // Cancela convites pendentes anteriores para o mesmo email/grupo
            var convitesPendentes = _context.ConvitesGrupo
                .Where(c => c.IdGrupo == groupId && c.EmailConvidado == dto.EmailConvidado && c.Status == "PENDENTE")
                .ToList();

            foreach (var c in convitesPendentes)
                c.Status = "CANCELADO";

            // Gera cÃ³digo Ãºnico de 8 caracteres
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

        // UsuÃ¡rio entra no grupo usando o cÃ³digo de convite
        public GroupResponseDTO JoinGroup(ulong userId, JoinGroupDTO dto)
        {
            var usuario = _context.Usuarios.FirstOrDefault(u => u.IdUsuario == userId);
            if (usuario == null)
                throw new Exception("UsuÃ¡rio nÃ£o encontrado.");

            var convite = _context.ConvitesGrupo
                .FirstOrDefault(c => c.CodigoConvite == dto.CodigoConvite);

            if (convite == null)
                throw new Exception("CÃ³digo de convite invÃ¡lido.");

            if (convite.Status != "PENDENTE")
                throw new Exception("Este convite jÃ¡ foi utilizado ou cancelado.");

            if (convite.ExpiraEm < DateTime.UtcNow)
            {
                convite.Status = "EXPIRADO";
                _context.SaveChanges();
                throw new Exception("Este convite expirou.");
            }

            if (convite.EmailConvidado != usuario.Email)
                throw new Exception("Este convite nÃ£o pertence ao seu email.");

            // Verifica se jÃ¡ Ã© membro
            var jaEhMembro = _context.GrupoUsuarios
                .Any(gu => gu.IdGrupo == convite.IdGrupo && gu.IdUsuario == userId && gu.Ativo);

            if (jaEhMembro)
                throw new Exception("VocÃª jÃ¡ Ã© membro deste grupo.");

            var grupo = _context.Grupos.FirstOrDefault(g => g.IdGrupo == convite.IdGrupo && g.Ativo)
                ?? throw new Exception("Grupo nÃ£o encontrado.");

            var totalAtivos = _context.GrupoUsuarios.Count(gu => gu.IdGrupo == grupo.IdGrupo && gu.Ativo);
            if (totalAtivos >= grupo.LimiteJogadores)
                throw new Exception("O grupo atingiu o limite de jogadores.");

            // Adiciona o usuÃ¡rio ao grupo como JOGADOR
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

        // Admin atualiza o horÃ¡rio fixo do grupo
        public void UpdateSchedule(ulong adminUserId, ulong groupId, int? diaSemana, string? horarioFixo)
        {
            var membro = _context.GrupoUsuarios
                .FirstOrDefault(gu => gu.IdGrupo == groupId && gu.IdUsuario == adminUserId && gu.Ativo);

            if (membro == null || membro.Perfil != "ADMIN")
                throw new Exception("Apenas administradores podem alterar o horÃ¡rio do grupo.");

            var grupo = _context.Grupos.FirstOrDefault(g => g.IdGrupo == groupId && g.Ativo)
                ?? throw new Exception("Grupo nÃ£o encontrado.");

            grupo.DiaSemana = diaSemana;
            grupo.HorarioFixo = horarioFixo;
            grupo.AtualizadoEm = DateTime.UtcNow;
            _context.SaveChanges();
        }

        // Admin lista todos os membros ativos do grupo
        public List<GroupMemberDTO> GetGroupMembers(ulong userId, ulong groupId)
        {
            EnsureMember(userId, groupId);

            var baseMembros = _context.GrupoUsuarios
                .Where(gu => gu.IdGrupo == groupId && gu.Ativo)
                .Join(
                    _context.Usuarios.Where(u => u.Ativo),
                    gu => gu.IdUsuario,
                    u => u.IdUsuario,
                    (gu, u) => new
                    {
                        IdUsuario = u.IdUsuario,
                        Nome = u.Nome,
                        Email = u.Email,
                        Perfil = gu.Perfil,
                        Goleiro = u.Goleiro,
                        TimeCoracaoCodigo = u.TimeCoracaoCodigo,
                        EntrouEm = gu.EntrouEm
                    })
                .OrderByDescending(m => m.Perfil == "ADMIN")
                .ThenBy(m => m.Nome)
                .ToList();

            return baseMembros.Select(m =>
            {
                var club = ClubCatalog.GetByCode(m.TimeCoracaoCodigo);
                return new GroupMemberDTO
                {
                    IdUsuario = m.IdUsuario,
                    Nome = m.Nome,
                    Email = m.Email,
                    Perfil = m.Perfil,
                    Goleiro = m.Goleiro,
                    TimeCoracaoCodigo = club?.Codigo,
                    TimeCoracaoNome = club?.Nome,
                    TimeCoracaoEscudoUrl = club?.EscudoUrl,
                    EntrouEm = m.EntrouEm
                };
            }).ToList();
        }

        // Admin adiciona jogador ao grupo pelo email
        public AddGroupMemberResultDTO AddMemberByEmail(ulong adminUserId, ulong groupId, AddGroupMemberDTO dto)
        {
            var (grupo, admin) = EnsureAdmin(adminUserId, groupId);

            var email = dto.Email.Trim().ToLowerInvariant();
            var usuario = _context.Usuarios.FirstOrDefault(u => u.Email.ToLower() == email && u.Ativo);

            if (usuario == null)
            {
                var convite = CreateOrReplaceInvite(adminUserId, groupId, email);
                var inviteLink = BuildInviteLink(email, convite.CodigoConvite);
                var sendResult = _inviteEmailService.SendGroupInvite(email, admin.Nome, grupo.Nome, inviteLink, convite.ExpiraEm);

                _logger.LogInformation(
                    "GROUP_MEMBER_INVITED | groupId={GroupId} group={GroupName} actorId={ActorId} actorName={ActorName} targetEmail={TargetEmail} inviteCode={InviteCode} sent={EmailSent} provider={Provider} configured={Configured} at={AtUtc}",
                    groupId, grupo.Nome, admin.IdUsuario, admin.Nome, email, convite.CodigoConvite, sendResult.Sent, sendResult.Provider, sendResult.Configured, DateTime.UtcNow);

                return new AddGroupMemberResultDTO
                {
                    Acao = "INVITED",
                    Mensagem = sendResult.Sent
                        ? "Convite enviado por e-mail com sucesso."
                        : sendResult.Configured
                            ? $"Convite criado, mas nao foi possivel enviar o e-mail via {sendResult.Provider}. Verifique os logs da API."
                            : "Convite criado, mas o envio de e-mail nao esta configurado. Verifique os logs da API.",
                    CodigoConvite = convite.CodigoConvite,
                    ExpiraEm = convite.ExpiraEm
                };
            }

            var membroExistente = _context.GrupoUsuarios
                .FirstOrDefault(gu => gu.IdGrupo == groupId && gu.IdUsuario == usuario.IdUsuario);

            if (membroExistente != null && membroExistente.Ativo)
                throw new Exception("Este usuario ja e membro do grupo.");

            var totalAtivos = _context.GrupoUsuarios.Count(gu => gu.IdGrupo == groupId && gu.Ativo);
            if (totalAtivos >= grupo.LimiteJogadores)
                throw new Exception("O grupo ja atingiu o limite de jogadores.");

            if (membroExistente == null)
            {
                _context.GrupoUsuarios.Add(new GrupoUsuario
                {
                    IdGrupo = groupId,
                    IdUsuario = usuario.IdUsuario,
                    Perfil = "JOGADOR",
                    Ativo = true,
                    EntrouEm = DateTime.UtcNow
                });
            }
            else
            {
                membroExistente.Ativo = true;
                membroExistente.Perfil = "JOGADOR";
                membroExistente.EntrouEm = DateTime.UtcNow;
            }

            _context.SaveChanges();

            _logger.LogInformation(
                "GROUP_MEMBER_ADDED | groupId={GroupId} group={GroupName} actorId={ActorId} actorName={ActorName} targetId={TargetId} targetEmail={TargetEmail} at={AtUtc}",
                groupId, grupo.Nome, admin.IdUsuario, admin.Nome, usuario.IdUsuario, usuario.Email, DateTime.UtcNow);

            return new AddGroupMemberResultDTO
            {
                Acao = "ADDED",
                Mensagem = "Jogador adicionado ao grupo com sucesso.",
                Membro = new GroupMemberDTO
                {
                    TimeCoracaoCodigo = ClubCatalog.GetByCode(usuario.TimeCoracaoCodigo)?.Codigo,
                    TimeCoracaoNome = ClubCatalog.GetByCode(usuario.TimeCoracaoCodigo)?.Nome,
                    TimeCoracaoEscudoUrl = ClubCatalog.GetByCode(usuario.TimeCoracaoCodigo)?.EscudoUrl,
                    IdUsuario = usuario.IdUsuario,
                    Nome = usuario.Nome,
                    Email = usuario.Email,
                    Perfil = "JOGADOR",
                    Goleiro = usuario.Goleiro,
                    EntrouEm = DateTime.UtcNow
                }
            };
        }

        // Admin remove um jogador do grupo
        public void RemoveMember(ulong adminUserId, ulong groupId, ulong memberUserId)
        {
            var (grupo, admin) = EnsureAdmin(adminUserId, groupId);

            if (adminUserId == memberUserId)
                throw new Exception("VocÃª nÃ£o pode remover seu prÃ³prio usuÃ¡rio.");

            var membro = _context.GrupoUsuarios
                .FirstOrDefault(gu => gu.IdGrupo == groupId && gu.IdUsuario == memberUserId && gu.Ativo)
                ?? throw new Exception("Membro nÃ£o encontrado neste grupo.");

            if (membro.Perfil == "ADMIN")
                throw new Exception("NÃ£o Ã© permitido remover outro administrador.");

            var usuario = _context.Usuarios.FirstOrDefault(u => u.IdUsuario == membro.IdUsuario);
            membro.Ativo = false;
            _context.SaveChanges();

            _logger.LogInformation(
                "GROUP_MEMBER_REMOVED | groupId={GroupId} group={GroupName} actorId={ActorId} actorName={ActorName} targetId={TargetId} targetName={TargetName} at={AtUtc}",
                groupId, grupo.Nome, admin.IdUsuario, admin.Nome, membro.IdUsuario, usuario?.Nome ?? "N/A", DateTime.UtcNow);
        }

        // Admin altera o perfil de um membro (ADMIN <-> JOGADOR)
        public GroupMemberDTO UpdateMemberRole(ulong adminUserId, ulong groupId, ulong memberUserId, string perfil)
        {
            var (grupo, admin) = EnsureAdmin(adminUserId, groupId);

            var novoPerfil = perfil.Trim().ToUpperInvariant();
            if (novoPerfil != "ADMIN" && novoPerfil != "JOGADOR")
                throw new Exception("Perfil invÃ¡lido. Use ADMIN ou JOGADOR.");

            var membro = _context.GrupoUsuarios
                .FirstOrDefault(gu => gu.IdGrupo == groupId && gu.IdUsuario == memberUserId && gu.Ativo)
                ?? throw new Exception("Membro nÃ£o encontrado neste grupo.");

            var usuario = _context.Usuarios.FirstOrDefault(u => u.IdUsuario == memberUserId && u.Ativo)
                ?? throw new Exception("UsuÃ¡rio do membro nÃ£o encontrado.");

            var perfilAnterior = membro.Perfil;
            if (perfilAnterior == novoPerfil)
                throw new Exception("O membro jÃ¡ possui este perfil.");

            if (perfilAnterior == "ADMIN" && novoPerfil != "ADMIN")
            {
                var totalAdmins = _context.GrupoUsuarios
                    .Count(gu => gu.IdGrupo == groupId && gu.Ativo && gu.Perfil == "ADMIN");

                if (totalAdmins <= 1)
                    throw new Exception("NÃ£o Ã© permitido remover/rebaixar o Ãºltimo administrador do grupo.");
            }

            membro.Perfil = novoPerfil;
            _context.SaveChanges();

            _logger.LogInformation(
                "GROUP_MEMBER_ROLE_UPDATED | groupId={GroupId} group={GroupName} actorId={ActorId} actorName={ActorName} targetId={TargetId} targetName={TargetName} from={FromRole} to={ToRole} at={AtUtc}",
                groupId, grupo.Nome, admin.IdUsuario, admin.Nome, usuario.IdUsuario, usuario.Nome, perfilAnterior, novoPerfil, DateTime.UtcNow);

            return new GroupMemberDTO
            {
                TimeCoracaoCodigo = ClubCatalog.GetByCode(usuario.TimeCoracaoCodigo)?.Codigo,
                TimeCoracaoNome = ClubCatalog.GetByCode(usuario.TimeCoracaoCodigo)?.Nome,
                TimeCoracaoEscudoUrl = ClubCatalog.GetByCode(usuario.TimeCoracaoCodigo)?.EscudoUrl,
                IdUsuario = usuario.IdUsuario,
                Nome = usuario.Nome,
                Email = usuario.Email,
                Perfil = membro.Perfil,
                Goleiro = usuario.Goleiro,
                EntrouEm = membro.EntrouEm
            };
        }

        // Gera cÃ³digo alfanumÃ©rico de 8 caracteres garantidamente Ãºnico
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

        private ConviteGrupo CreateOrReplaceInvite(ulong adminUserId, ulong groupId, string email)
        {
            var pendentes = _context.ConvitesGrupo
                .Where(c => c.IdGrupo == groupId && c.EmailConvidado == email && c.Status == "PENDENTE")
                .ToList();

            foreach (var c in pendentes)
                c.Status = "CANCELADO";

            var convite = new ConviteGrupo
            {
                IdGrupo = groupId,
                EmailConvidado = email,
                CodigoConvite = GerarCodigoUnico(),
                CriadoPorUsuario = adminUserId,
                ExpiraEm = DateTime.UtcNow.AddDays(7)
            };

            _context.ConvitesGrupo.Add(convite);
            _context.SaveChanges();
            return convite;
        }

        private string BuildInviteLink(string email, string codigoConvite)
        {
            var template = _configuration["InviteSettings:RegisterLinkTemplate"];
            if (string.IsNullOrWhiteSpace(template))
            {
                template = "resenha://register?email={email}&invite={code}";
            }

            return template
                .Replace("{email}", Uri.EscapeDataString(email))
                .Replace("{code}", Uri.EscapeDataString(codigoConvite));
        }

        // Valida se o solicitante Ã© admin no grupo e retorna o grupo
        private (Grupo Grupo, Usuario Admin) EnsureAdmin(ulong userId, ulong groupId)
        {
            var membro = _context.GrupoUsuarios
                .FirstOrDefault(gu => gu.IdGrupo == groupId && gu.IdUsuario == userId && gu.Ativo);

            if (membro == null)
                throw new Exception("VocÃª nÃ£o Ã© membro deste grupo.");

            if (membro.Perfil != "ADMIN")
                throw new Exception("Apenas administradores podem realizar esta aÃ§Ã£o.");

            var grupo = _context.Grupos.FirstOrDefault(g => g.IdGrupo == groupId && g.Ativo)
                ?? throw new Exception("Grupo nÃ£o encontrado.");

            var admin = _context.Usuarios.FirstOrDefault(u => u.IdUsuario == userId && u.Ativo)
                ?? throw new Exception("UsuÃ¡rio administrador nÃ£o encontrado.");

            return (grupo, admin);
        }

        // Valida se o solicitante Ã© membro ativo no grupo
        private void EnsureMember(ulong userId, ulong groupId)
        {
            var membro = _context.GrupoUsuarios
                .FirstOrDefault(gu => gu.IdGrupo == groupId && gu.IdUsuario == userId && gu.Ativo);

            if (membro == null)
                throw new Exception("VocÃª nÃ£o Ã© membro deste grupo.");

            var grupo = _context.Grupos.FirstOrDefault(g => g.IdGrupo == groupId && g.Ativo);
            if (grupo == null)
                throw new Exception("Grupo nÃ£o encontrado.");
        }
    }
}


