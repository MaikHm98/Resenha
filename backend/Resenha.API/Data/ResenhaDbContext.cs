using Microsoft.EntityFrameworkCore;
using Resenha.API.Entities;

namespace Resenha.API.Data
{
    // Contexto principal do banco de dados — mapeia todas as tabelas do projeto
    public class ResenhaDbContext : DbContext
    {
        public ResenhaDbContext(DbContextOptions<ResenhaDbContext> options)
            : base(options)
        {
        }

        // ── Usuários e Grupos ──────────────────────────────────────
        public DbSet<Usuario> Usuarios { get; set; } = null!;
        public DbSet<TokenRecuperacaoSenha> TokensRecuperacaoSenha { get; set; } = null!;
        public DbSet<AuditoriaSeguranca> AuditoriasSeguranca { get; set; } = null!;
        public DbSet<Grupo> Grupos { get; set; } = null!;
        public DbSet<GrupoUsuario> GrupoUsuarios { get; set; } = null!;
        public DbSet<ConviteGrupo> ConvitesGrupo { get; set; } = null!;

        // ── Temporadas e Partidas ──────────────────────────────────
        public DbSet<Temporada> Temporadas { get; set; } = null!;
        public DbSet<Partida> Partidas { get; set; } = null!;
        public DbSet<PresencaPartida> PresencasPartida { get; set; } = null!;

        // ── Sistema de Capitão ─────────────────────────────────────
        public DbSet<CicloCapitao> CiclosCapitao { get; set; } = null!;
        public DbSet<CicloCapitaoBloqueado> CiclosCapitaoBloqueados { get; set; } = null!;

        // ── Times e Resultado ──────────────────────────────────────
        public DbSet<TimePartida> TimesPartida { get; set; } = null!;
        public DbSet<JogadorTimePartida> JogadoresTimePartida { get; set; } = null!;
        public DbSet<ResultadoPartida> ResultadosPartida { get; set; } = null!;
        public DbSet<EstatisticaPartida> EstatisticasPartida { get; set; } = null!;

        // ── Votação ────────────────────────────────────────────────
        public DbSet<VotacaoPartida> VotacoesPartida { get; set; } = null!;
        public DbSet<Voto> Votos { get; set; } = null!;

        // ── Classificação ──────────────────────────────────────────
        public DbSet<ClassificacaoTemporada> ClassificacoesTemporada { get; set; } = null!;
        public DbSet<ClassificacaoGeralGrupo> ClassificacoesGeralGrupo { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Índices únicos para evitar duplicidades
            modelBuilder.Entity<GrupoUsuario>()
                .HasIndex(g => new { g.IdGrupo, g.IdUsuario })
                .IsUnique();

            modelBuilder.Entity<PresencaPartida>()
                .HasIndex(p => new { p.IdPartida, p.IdUsuario })
                .IsUnique();

            modelBuilder.Entity<CicloCapitaoBloqueado>()
                .HasIndex(c => new { c.IdCiclo, c.IdUsuarioBloqueado })
                .IsUnique();

            modelBuilder.Entity<TimePartida>()
                .HasIndex(t => new { t.IdPartida, t.NumeroTime })
                .IsUnique();

            modelBuilder.Entity<JogadorTimePartida>()
                .HasIndex(j => new { j.IdTime, j.IdUsuario })
                .IsUnique();

            modelBuilder.Entity<ResultadoPartida>()
                .HasIndex(r => r.IdPartida)
                .IsUnique();

            modelBuilder.Entity<VotacaoPartida>()
                .HasIndex(v => new { v.IdPartida, v.Tipo, v.Rodada })
                .IsUnique();

            modelBuilder.Entity<Voto>()
                .HasIndex(v => new { v.IdVotacao, v.IdUsuarioEleitor })
                .IsUnique();

            modelBuilder.Entity<ClassificacaoTemporada>()
                .HasIndex(c => new { c.IdTemporada, c.IdUsuario })
                .IsUnique();

            modelBuilder.Entity<ClassificacaoGeralGrupo>()
                .HasIndex(c => new { c.IdGrupo, c.IdUsuario })
                .IsUnique();

            modelBuilder.Entity<ConviteGrupo>()
                .HasIndex(c => c.CodigoConvite)
                .IsUnique();

            modelBuilder.Entity<Usuario>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<TokenRecuperacaoSenha>()
                .HasIndex(t => t.TokenHash)
                .IsUnique();

            modelBuilder.Entity<TokenRecuperacaoSenha>()
                .HasIndex(t => new { t.IdUsuario, t.CriadoEm });

            modelBuilder.Entity<Temporada>()
                .HasIndex(t => new { t.IdGrupo, t.Ano })
                .IsUnique();
        }
    }
}
