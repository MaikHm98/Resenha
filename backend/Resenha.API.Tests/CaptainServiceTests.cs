using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Resenha.API.Data;
using Resenha.API.DTOs.Captain;
using Resenha.API.Entities;
using Resenha.API.Services;
using Xunit;

namespace Resenha.API.Tests;

public class CaptainServiceTests
{
    [Fact]
    public void DrawCaptain_DeveCriarCicloAtivoComAdminComoCapitao()
    {
        using var harness = CriarHarness();
        var contexto = harness.Contexto;

        var grupo = CriarGrupo(contexto, 1, 99);
        var admin = CriarUsuario(contexto, 99, "Admin", false);
        VincularMembro(contexto, grupo.IdGrupo, admin.IdUsuario, "ADMIN");
        CriarTemporada(contexto, grupo.IdGrupo, 1);
        contexto.SaveChanges();

        var service = new CaptainService(contexto);

        var status = service.DrawCaptain(admin.IdUsuario, grupo.IdGrupo);

        Assert.Equal(admin.IdUsuario, status.IdCapitao);
        Assert.Equal("ATIVO", status.Status);
        Assert.Null(status.IdDesafiante);
        Assert.Single(contexto.CiclosCapitao.Where(c => c.IdGrupo == grupo.IdGrupo && c.Status == "ATIVO"));
    }

    [Fact]
    public void Challenge_DeveBloquearQuandoPartidaTiverMenosDeDozeConfirmados()
    {
        using var harness = CriarHarness();
        var contexto = harness.Contexto;
        var (grupo, partida, capitao, desafiante) = SeedCicloComPartida(contexto, confirmados: 11);
        var service = new CaptainService(contexto);

        var ex = Assert.Throws<Exception>(() => service.Challenge(capitao.IdUsuario, grupo.IdGrupo, new LaunchChallengeDTO
        {
            IdPartida = partida.IdPartida,
            IdDesafiante = desafiante.IdUsuario
        }));

        Assert.Equal("S\u00e3o necess\u00e1rios pelo menos 12 confirmados para lan\u00e7ar o desafio. Atualmente h\u00e1 11.", ex.Message);
    }

    [Fact]
    public void GetEligibleChallengers_DeveExcluirCapitaoBloqueadosEConvidados()
    {
        using var harness = CriarHarness();
        var contexto = harness.Contexto;
        var (grupo, partida, capitao, _, bloqueado, elegivel, convidado) = SeedElegiveis(contexto);
        var service = new CaptainService(contexto);

        var elegiveis = service.GetEligibleChallengers(capitao.IdUsuario, grupo.IdGrupo, partida.IdPartida);

        Assert.Contains(elegiveis, jogador => jogador.IdUsuario == elegivel.IdUsuario);
        Assert.DoesNotContain(elegiveis, jogador => jogador.IdUsuario == capitao.IdUsuario);
        Assert.DoesNotContain(elegiveis, jogador => jogador.IdUsuario == bloqueado.IdUsuario);
        Assert.DoesNotContain(elegiveis, jogador => jogador.IdUsuario == convidado.IdUsuario);
    }

    [Fact]
    public void RegisterResult_CapitaoVence_DeveBloquearDesafianteERegistrarHistorico()
    {
        using var harness = CriarHarness();
        var contexto = harness.Contexto;
        var (grupo, partida, admin, capitao, desafiante, ciclo) = SeedDesafioPendente(contexto);
        var service = new CaptainService(contexto);

        var status = service.RegisterResult(admin.IdUsuario, grupo.IdGrupo, new ChallengeResultDTO
        {
            Resultado = "CAPITAO"
        });

        var cicloAtualizado = contexto.CiclosCapitao.Single(c => c.IdCiclo == ciclo.IdCiclo);
        var historico = contexto.HistoricosCapitao.Single(h => h.IdPartida == partida.IdPartida);
        var bloqueado = contexto.CiclosCapitaoBloqueados.Single(b => b.IdCiclo == ciclo.IdCiclo);

        Assert.Equal(capitao.IdUsuario, status.IdCapitao);
        Assert.Null(status.IdDesafiante);
        Assert.Equal("ATIVO", cicloAtualizado.Status);
        Assert.Null(cicloAtualizado.IdDesafianteAtual);
        Assert.Equal(desafiante.IdUsuario, bloqueado.IdUsuarioBloqueado);
        Assert.Equal("CAPITAO", historico.Resultado);
        Assert.Equal(capitao.IdUsuario, historico.IdVencedor);
        Assert.Equal(desafiante.IdUsuario, historico.IdDerrotado);
    }

    [Fact]
    public void RegisterResult_DesafianteVence_DeveEncerrarCicloCriarNovoERegistrarHistorico()
    {
        using var harness = CriarHarness();
        var contexto = harness.Contexto;
        var (grupo, partida, admin, capitao, desafiante, ciclo) = SeedDesafioPendente(contexto);
        var service = new CaptainService(contexto);

        var status = service.RegisterResult(admin.IdUsuario, grupo.IdGrupo, new ChallengeResultDTO
        {
            Resultado = "DESAFIANTE"
        });

        var cicloAnterior = contexto.CiclosCapitao.Single(c => c.IdCiclo == ciclo.IdCiclo);
        var novoCiclo = contexto.CiclosCapitao.Single(c => c.Status == "ATIVO");
        var historico = contexto.HistoricosCapitao.Single(h => h.IdPartida == partida.IdPartida);

        Assert.Equal("ENCERRADO", cicloAnterior.Status);
        Assert.Equal(desafiante.IdUsuario, novoCiclo.IdCapitaoAtual);
        Assert.Equal(desafiante.IdUsuario, status.IdCapitao);
        Assert.Null(status.IdDesafiante);
        Assert.Equal("DESAFIANTE", historico.Resultado);
        Assert.Equal(desafiante.IdUsuario, historico.IdVencedor);
        Assert.Equal(capitao.IdUsuario, historico.IdDerrotado);
    }

    [Fact]
    public void GetStatus_DeveRetornarHistoricoOrdenadoDoMaisRecenteParaOMaisAntigo()
    {
        using var harness = CriarHarness();
        var contexto = harness.Contexto;

        var grupo = CriarGrupo(contexto, 20, 99);
        var admin = CriarUsuario(contexto, 99, "Admin", false);
        var capitao = CriarUsuario(contexto, 1, "Capitao", false);
        var desafiante1 = CriarUsuario(contexto, 2, "Desafiante 1", false);
        var desafiante2 = CriarUsuario(contexto, 3, "Desafiante 2", false);
        VincularMembro(contexto, grupo.IdGrupo, admin.IdUsuario, "ADMIN");
        VincularMembro(contexto, grupo.IdGrupo, capitao.IdUsuario);
        VincularMembro(contexto, grupo.IdGrupo, desafiante1.IdUsuario);
        VincularMembro(contexto, grupo.IdGrupo, desafiante2.IdUsuario);

        var temporada = CriarTemporada(contexto, grupo.IdGrupo, 20);
        var ciclo = new CicloCapitao
        {
            IdCiclo = 20,
            IdGrupo = grupo.IdGrupo,
            IdTemporada = temporada.IdTemporada,
            IdCapitaoAtual = capitao.IdUsuario,
            Status = "ATIVO"
        };
        contexto.CiclosCapitao.Add(ciclo);

        contexto.HistoricosCapitao.Add(new HistoricoCapitao
        {
            IdHistorico = 1,
            IdGrupo = grupo.IdGrupo,
            IdPartida = 100,
            IdCiclo = ciclo.IdCiclo,
            IdCapitao = capitao.IdUsuario,
            IdDesafiante = desafiante1.IdUsuario,
            IdVencedor = capitao.IdUsuario,
            IdDerrotado = desafiante1.IdUsuario,
            Resultado = "CAPITAO",
            RegistradoEm = DateTime.UtcNow.AddDays(-2)
        });

        contexto.HistoricosCapitao.Add(new HistoricoCapitao
        {
            IdHistorico = 2,
            IdGrupo = grupo.IdGrupo,
            IdPartida = 101,
            IdCiclo = ciclo.IdCiclo,
            IdCapitao = capitao.IdUsuario,
            IdDesafiante = desafiante2.IdUsuario,
            IdVencedor = desafiante2.IdUsuario,
            IdDerrotado = capitao.IdUsuario,
            Resultado = "DESAFIANTE",
            RegistradoEm = DateTime.UtcNow.AddDays(-1)
        });

        contexto.SaveChanges();

        var service = new CaptainService(contexto);

        var status = service.GetStatus(capitao.IdUsuario, grupo.IdGrupo);

        Assert.Equal(2, status.Historico.Count);
        Assert.Equal(101UL, status.Historico[0].IdPartida);
        Assert.Equal(100UL, status.Historico[1].IdPartida);
    }

    private static (Grupo grupo, Partida partida, Usuario capitao, Usuario desafiante) SeedCicloComPartida(ResenhaDbContext contexto, int confirmados)
    {
        var grupo = CriarGrupo(contexto, 10, 99);
        var admin = CriarUsuario(contexto, 99, "Admin", false);
        var capitao = CriarUsuario(contexto, 1, "Capitao", false);
        var desafiante = CriarUsuario(contexto, 2, "Desafiante", false);

        VincularMembro(contexto, grupo.IdGrupo, admin.IdUsuario, "ADMIN");
        VincularMembro(contexto, grupo.IdGrupo, capitao.IdUsuario);
        VincularMembro(contexto, grupo.IdGrupo, desafiante.IdUsuario);

        for (ulong i = 3; i <= 14; i++)
        {
            var jogador = CriarUsuario(contexto, i, $"Jogador {i}", false);
            VincularMembro(contexto, grupo.IdGrupo, jogador.IdUsuario);
        }

        var temporada = CriarTemporada(contexto, grupo.IdGrupo, 10);
        var ciclo = new CicloCapitao
        {
            IdCiclo = 10,
            IdGrupo = grupo.IdGrupo,
            IdTemporada = temporada.IdTemporada,
            IdCapitaoAtual = capitao.IdUsuario,
            Status = "ATIVO"
        };
        contexto.CiclosCapitao.Add(ciclo);

        var partida = CriarPartida(contexto, 10, grupo.IdGrupo, temporada.IdTemporada, DateTime.UtcNow.AddHours(3), admin.IdUsuario);

        for (ulong i = 1; i <= (ulong)confirmados; i++)
        {
            ConfirmarPresenca(contexto, partida.IdPartida, i);
        }

        contexto.SaveChanges();
        return (grupo, partida, capitao, desafiante);
    }

    private static (Grupo grupo, Partida partida, Usuario capitao, Usuario admin, Usuario bloqueado, Usuario elegivel, Usuario convidado) SeedElegiveis(ResenhaDbContext contexto)
    {
        var grupo = CriarGrupo(contexto, 11, 99);
        var admin = CriarUsuario(contexto, 99, "Admin", false);
        var capitao = CriarUsuario(contexto, 1, "Capitao", false);
        var bloqueado = CriarUsuario(contexto, 2, "Bloqueado", false);
        var elegivel = CriarUsuario(contexto, 3, "Elegivel", false);
        var convidado = CriarUsuario(contexto, 4, "Convidado", false, convidado: true);

        VincularMembro(contexto, grupo.IdGrupo, admin.IdUsuario, "ADMIN");
        VincularMembro(contexto, grupo.IdGrupo, capitao.IdUsuario);
        VincularMembro(contexto, grupo.IdGrupo, bloqueado.IdUsuario);
        VincularMembro(contexto, grupo.IdGrupo, elegivel.IdUsuario);
        VincularMembro(contexto, grupo.IdGrupo, convidado.IdUsuario);

        var temporada = CriarTemporada(contexto, grupo.IdGrupo, 11);
        var ciclo = new CicloCapitao
        {
            IdCiclo = 11,
            IdGrupo = grupo.IdGrupo,
            IdTemporada = temporada.IdTemporada,
            IdCapitaoAtual = capitao.IdUsuario,
            Status = "ATIVO"
        };
        contexto.CiclosCapitao.Add(ciclo);

        contexto.CiclosCapitaoBloqueados.Add(new CicloCapitaoBloqueado
        {
            IdCiclo = ciclo.IdCiclo,
            IdUsuarioBloqueado = bloqueado.IdUsuario
        });

        var partida = CriarPartida(contexto, 11, grupo.IdGrupo, temporada.IdTemporada, DateTime.UtcNow.AddHours(3), admin.IdUsuario);
        ConfirmarPresenca(contexto, partida.IdPartida, capitao.IdUsuario);
        ConfirmarPresenca(contexto, partida.IdPartida, bloqueado.IdUsuario);
        ConfirmarPresenca(contexto, partida.IdPartida, elegivel.IdUsuario);
        ConfirmarPresenca(contexto, partida.IdPartida, convidado.IdUsuario);
        contexto.SaveChanges();

        return (grupo, partida, capitao, admin, bloqueado, elegivel, convidado);
    }

    private static (Grupo grupo, Partida partida, Usuario admin, Usuario capitao, Usuario desafiante, CicloCapitao ciclo) SeedDesafioPendente(ResenhaDbContext contexto)
    {
        var grupo = CriarGrupo(contexto, 12, 99);
        var admin = CriarUsuario(contexto, 99, "Admin", false);
        var capitao = CriarUsuario(contexto, 1, "Capitao", false);
        var desafiante = CriarUsuario(contexto, 2, "Desafiante", false);

        VincularMembro(contexto, grupo.IdGrupo, admin.IdUsuario, "ADMIN");
        VincularMembro(contexto, grupo.IdGrupo, capitao.IdUsuario);
        VincularMembro(contexto, grupo.IdGrupo, desafiante.IdUsuario);

        var temporada = CriarTemporada(contexto, grupo.IdGrupo, 12);
        var ciclo = new CicloCapitao
        {
            IdCiclo = 12,
            IdGrupo = grupo.IdGrupo,
            IdTemporada = temporada.IdTemporada,
            IdCapitaoAtual = capitao.IdUsuario,
            IdDesafianteAtual = desafiante.IdUsuario,
            Status = "ATIVO"
        };
        contexto.CiclosCapitao.Add(ciclo);

        var partida = CriarPartida(contexto, 12, grupo.IdGrupo, temporada.IdTemporada, DateTime.UtcNow.AddHours(3), admin.IdUsuario);
        partida.IdCicloCapitao = ciclo.IdCiclo;
        contexto.SaveChanges();

        return (grupo, partida, admin, capitao, desafiante, ciclo);
    }

    private static Grupo CriarGrupo(ResenhaDbContext contexto, ulong idGrupo, ulong criadoPorUsuario)
    {
        var grupo = new Grupo
        {
            IdGrupo = idGrupo,
            Nome = $"Grupo {idGrupo}",
            CriadoPorUsuario = criadoPorUsuario,
            LimiteJogadores = 20,
            Ativo = true
        };

        contexto.Grupos.Add(grupo);
        return grupo;
    }

    private static Usuario CriarUsuario(ResenhaDbContext contexto, ulong idUsuario, string nome, bool goleiro, bool convidado = false)
    {
        var usuario = new Usuario
        {
            IdUsuario = idUsuario,
            Nome = nome,
            Email = $"{nome.Replace(" ", string.Empty).ToLowerInvariant()}@teste.com",
            SenhaHash = "hash",
            Goleiro = goleiro,
            Convidado = convidado,
            Ativo = true
        };

        contexto.Usuarios.Add(usuario);
        return usuario;
    }

    private static void VincularMembro(ResenhaDbContext contexto, ulong idGrupo, ulong idUsuario, string perfil = "JOGADOR")
    {
        contexto.GrupoUsuarios.Add(new GrupoUsuario
        {
            IdGrupo = idGrupo,
            IdUsuario = idUsuario,
            Perfil = perfil,
            Ativo = true
        });
    }

    private static Temporada CriarTemporada(ResenhaDbContext contexto, ulong idGrupo, ulong idTemporada)
    {
        var temporada = new Temporada
        {
            IdTemporada = idTemporada,
            IdGrupo = idGrupo,
            Ano = 2026,
            Nome = "Temporada 2026",
            Status = "ATIVA"
        };

        contexto.Temporadas.Add(temporada);
        return temporada;
    }

    private static Partida CriarPartida(ResenhaDbContext contexto, ulong idPartida, ulong idGrupo, ulong idTemporada, DateTime dataHoraJogo, ulong criadoPorUsuario)
    {
        var partida = new Partida
        {
            IdPartida = idPartida,
            IdGrupo = idGrupo,
            IdTemporada = idTemporada,
            DataHoraJogo = dataHoraJogo,
            LimiteVagas = 20,
            CriadoPorUsuario = criadoPorUsuario,
            Status = "ABERTA"
        };

        contexto.Partidas.Add(partida);
        return partida;
    }

    private static void ConfirmarPresenca(ResenhaDbContext contexto, ulong idPartida, ulong idUsuario)
    {
        contexto.PresencasPartida.Add(new PresencaPartida
        {
            IdPartida = idPartida,
            IdUsuario = idUsuario,
            Status = "CONFIRMADO"
        });
    }

    private sealed class TestHarness : IDisposable
    {
        private readonly SqliteConnection _connection;
        public ResenhaDbContext Contexto { get; }

        public TestHarness()
        {
            _connection = new SqliteConnection("DataSource=:memory:");
            _connection.Open();

            var options = new DbContextOptionsBuilder<ResenhaDbContext>()
                .UseSqlite(_connection)
                .Options;

            Contexto = new ResenhaDbContext(options);
            Contexto.Database.EnsureCreated();
        }

        public void Dispose()
        {
            Contexto.Dispose();
            _connection.Dispose();
        }
    }

    private static TestHarness CriarHarness() => new();
}
