using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Resenha.API.Data;
using Resenha.API.DTOs.Matches;
using Resenha.API.Entities;
using Resenha.API.Services;
using Xunit;

namespace Resenha.API.Tests;

public class MatchServiceChallengeTests
{
    [Fact]
    public void ConfirmPresence_DeveBloquearTerceiroGoleiro()
    {
        using var harness = CriarHarness();
        var agoraBrasilia = ObterAgoraBrasilia();
        var contexto = harness.Contexto;

        var grupo = CriarGrupo(contexto, 1, 99);
        var admin = CriarUsuario(contexto, 99, "Admin", false);
        VincularMembro(contexto, grupo.IdGrupo, admin.IdUsuario, "ADMIN");

        var goleiro1 = CriarUsuario(contexto, 1, "Goleiro 1", true);
        var goleiro2 = CriarUsuario(contexto, 2, "Goleiro 2", true);
        var goleiro3 = CriarUsuario(contexto, 3, "Goleiro 3", true);
        VincularMembro(contexto, grupo.IdGrupo, goleiro1.IdUsuario);
        VincularMembro(contexto, grupo.IdGrupo, goleiro2.IdUsuario);
        VincularMembro(contexto, grupo.IdGrupo, goleiro3.IdUsuario);

        var temporada = CriarTemporada(contexto, grupo.IdGrupo, 1);
        var partida = CriarPartida(contexto, 1, grupo.IdGrupo, temporada.IdTemporada, agoraBrasilia.AddHours(2), admin.IdUsuario);
        ConfirmarPresenca(contexto, partida.IdPartida, goleiro1.IdUsuario);
        ConfirmarPresenca(contexto, partida.IdPartida, goleiro2.IdUsuario);
        contexto.SaveChanges();

        var service = new MatchService(contexto, new FakeInviteEmailService());

        var ex = Assert.Throws<Exception>(() => service.ConfirmPresence(goleiro3.IdUsuario, partida.IdPartida));
        Assert.Equal("O limite de goleiros confirmados para esta partida ja foi atingido.", ex.Message);
    }

    [Fact]
    public void AddGuestToMatch_DevePermitirAdminAdicionarConvidado()
    {
        using var harness = CriarHarness();
        var agoraBrasilia = ObterAgoraBrasilia();
        var contexto = harness.Contexto;

        var grupo = CriarGrupo(contexto, 2, 99);
        var admin = CriarUsuario(contexto, 99, "Admin", false);
        VincularMembro(contexto, grupo.IdGrupo, admin.IdUsuario, "ADMIN");

        var temporada = CriarTemporada(contexto, grupo.IdGrupo, 2);
        var partida = CriarPartida(contexto, 2, grupo.IdGrupo, temporada.IdTemporada, agoraBrasilia.AddHours(2), admin.IdUsuario);
        contexto.SaveChanges();

        var service = new MatchService(contexto, new FakeInviteEmailService());

        var response = service.AddGuestToMatch(admin.IdUsuario, partida.IdPartida, new AddGuestToMatchDTO
        {
            Nome = "Visitante"
        });

        var convidado = contexto.Usuarios.First(u => u.Email.EndsWith("@resenha.local"));

        Assert.Equal("CONFIRMADO", response.Status);
        Assert.Equal(1, response.TotalConfirmados);
        Assert.True(convidado.Convidado);
        Assert.Equal("Visitante", convidado.Nome);
    }

    [Fact]
    public void AddGuestToMatch_DeveBloquearQuandoListaJaEstiverCheia()
    {
        using var harness = CriarHarness();
        var agoraBrasilia = ObterAgoraBrasilia();
        var contexto = harness.Contexto;

        var grupo = CriarGrupo(contexto, 3, 99);
        var admin = CriarUsuario(contexto, 99, "Admin", false);
        var jogador = CriarUsuario(contexto, 1, "Jogador", false);
        VincularMembro(contexto, grupo.IdGrupo, admin.IdUsuario, "ADMIN");
        VincularMembro(contexto, grupo.IdGrupo, jogador.IdUsuario);

        var temporada = CriarTemporada(contexto, grupo.IdGrupo, 3);
        var partida = CriarPartida(contexto, 3, grupo.IdGrupo, temporada.IdTemporada, agoraBrasilia.AddHours(2), admin.IdUsuario);
        partida.LimiteVagas = 1;
        ConfirmarPresenca(contexto, partida.IdPartida, jogador.IdUsuario);
        contexto.SaveChanges();

        var service = new MatchService(contexto, new FakeInviteEmailService());

        var ex = Assert.Throws<Exception>(() => service.AddGuestToMatch(admin.IdUsuario, partida.IdPartida, new AddGuestToMatchDTO
        {
            Nome = "Visitante"
        }));

        Assert.Equal("Vagas encerradas. Limite de 1 jogadores atingido.", ex.Message);
    }

    [Fact]
    public void ConfirmPresence_DeveBloquearConfirmacaoComMenosDeVinteMinutos()
    {
        using var harness = CriarHarness();
        var agoraBrasilia = ObterAgoraBrasilia();
        var contexto = harness.Contexto;

        var grupo = CriarGrupo(contexto, 1, 99);
        var admin = CriarUsuario(contexto, 99, "Admin", false);
        var jogador = CriarUsuario(contexto, 1, "Jogador", false);
        VincularMembro(contexto, grupo.IdGrupo, admin.IdUsuario, "ADMIN");
        VincularMembro(contexto, grupo.IdGrupo, jogador.IdUsuario);

        var temporada = CriarTemporada(contexto, grupo.IdGrupo, 1);
        var partida = CriarPartida(contexto, 1, grupo.IdGrupo, temporada.IdTemporada, agoraBrasilia.AddMinutes(10), admin.IdUsuario);
        contexto.SaveChanges();

        var service = new MatchService(contexto, new FakeInviteEmailService());

        var ex = Assert.Throws<Exception>(() => service.ConfirmPresence(jogador.IdUsuario, partida.IdPartida));
        Assert.Equal("As confirmações ficam abertas somente até 20 minutos antes do jogo.", ex.Message);
    }

    [Fact]
    public void CancelPresence_DeveNotificarVagaReabertaQuandoListaEstavaCheia()
    {
        using var harness = CriarHarness();
        var agoraBrasilia = ObterAgoraBrasilia();
        var contexto = harness.Contexto;

        var grupo = CriarGrupo(contexto, 4, 1);
        var jogador1 = CriarUsuario(contexto, 1, "Jogador 1", false);
        var jogador2 = CriarUsuario(contexto, 2, "Jogador 2", false);
        VincularMembro(contexto, grupo.IdGrupo, jogador1.IdUsuario);
        VincularMembro(contexto, grupo.IdGrupo, jogador2.IdUsuario);

        var temporada = CriarTemporada(contexto, grupo.IdGrupo, 4);
        var partida = CriarPartida(contexto, 4, grupo.IdGrupo, temporada.IdTemporada, agoraBrasilia.AddHours(2), jogador1.IdUsuario);
        partida.LimiteVagas = 2;
        ConfirmarPresenca(contexto, partida.IdPartida, jogador1.IdUsuario);
        ConfirmarPresenca(contexto, partida.IdPartida, jogador2.IdUsuario);
        contexto.SaveChanges();

        var fakeEmail = new FakeInviteEmailService();
        var service = new MatchService(contexto, fakeEmail);

        var response = service.CancelPresence(jogador1.IdUsuario, partida.IdPartida);

        Assert.Equal("CANCELADO", response.Status);
        Assert.Equal(1, response.TotalConfirmados);
        Assert.Equal(1, fakeEmail.MatchSlotReopenedCalls);
    }

    [Fact]
    public void StartLineDraw_DevePermitirCapitaoAtualEscolherParidade()
    {
        using var harness = CriarHarness();
        var contexto = harness.Contexto;
        var (grupo, partida, capitao, desafiante) = SeedDesafioPronto(contexto);
        var service = new MatchService(contexto, new FakeInviteEmailService());

        var status = service.StartLineDraw(capitao.IdUsuario, partida.IdPartida, new IniciarParImparLinhaDTO
        {
            EscolhaParidade = "PAR"
        });

        Assert.Equal("PAR_IMPAR_LINHA", status.StatusDesafio);
        Assert.Equal("PAR", status.ParidadeCapitaoAtual);
        Assert.Equal("IMPAR", status.ParidadeDesafiante);
        Assert.True(status.UsuarioPodeInformarNumero);
        Assert.Null(status.VencedorParImparLinha);
        Assert.Equal(grupo.IdGrupo, status.IdGrupo);
    }

    [Fact]
    public void StartLineDraw_DeveBloquearUsuarioQueNaoEhCapitaoAtual()
    {
        using var harness = CriarHarness();
        var contexto = harness.Contexto;
        var (_, partida, _, desafiante) = SeedDesafioPronto(contexto);
        var service = new MatchService(contexto, new FakeInviteEmailService());

        var ex = Assert.Throws<Exception>(() => service.StartLineDraw(desafiante.IdUsuario, partida.IdPartida, new IniciarParImparLinhaDTO
        {
            EscolhaParidade = "IMPAR"
        }));

        Assert.Equal("Apenas o capitão atual pode escolher entre par ou ímpar.", ex.Message);
    }

    [Fact]
    public void SubmitLineDrawNumber_DeveDefinirVencedorEPrimeiraEscolha()
    {
        using var harness = CriarHarness();
        var contexto = harness.Contexto;
        var (_, partida, capitao, desafiante) = SeedDesafioPronto(contexto);
        var service = new MatchService(contexto, new FakeInviteEmailService());

        service.StartLineDraw(capitao.IdUsuario, partida.IdPartida, new IniciarParImparLinhaDTO
        {
            EscolhaParidade = "PAR"
        });

        service.SubmitLineDrawNumber(capitao.IdUsuario, partida.IdPartida, new RegistrarNumeroParImparLinhaDTO
        {
            Numero = 4
        });

        var resultado = service.SubmitLineDrawNumber(desafiante.IdUsuario, partida.IdPartida, new RegistrarNumeroParImparLinhaDTO
        {
            Numero = 3
        });

        Assert.Equal("ESCOLHA_EM_ANDAMENTO", resultado.StatusDesafio);
        Assert.Equal(7, resultado.SomaParImparLinha);
        Assert.NotNull(resultado.VencedorParImparLinha);
        Assert.Equal(desafiante.IdUsuario, (ulong)resultado.VencedorParImparLinha!.IdUsuario);
        Assert.NotNull(resultado.ProximoCapitaoEscolha);
        Assert.Equal(desafiante.IdUsuario, (ulong)resultado.ProximoCapitaoEscolha!.IdUsuario);
        Assert.Equal("PAR", resultado.ParidadeCapitaoAtual);
        Assert.Equal("IMPAR", resultado.ParidadeDesafiante);
    }

    [Fact]
    public void GetChallengeStatus_NaoDeveExporNumeroDoOutroCapitaoAntesDoSorteioFechar()
    {
        using var harness = CriarHarness();
        var contexto = harness.Contexto;
        var (_, partida, capitao, desafiante) = SeedDesafioPronto(contexto);
        var service = new MatchService(contexto, new FakeInviteEmailService());

        service.StartLineDraw(capitao.IdUsuario, partida.IdPartida, new IniciarParImparLinhaDTO
        {
            EscolhaParidade = "PAR"
        });

        service.SubmitLineDrawNumber(capitao.IdUsuario, partida.IdPartida, new RegistrarNumeroParImparLinhaDTO
        {
            Numero = 8
        });

        var statusDoDesafiante = service.GetChallengeStatus(desafiante.IdUsuario, partida.IdPartida);

        Assert.True(statusDoDesafiante.CapitaoAtualJaInformouNumero);
        Assert.False(statusDoDesafiante.DesafianteJaInformouNumero);
        Assert.Null(statusDoDesafiante.NumeroCapitaoAtual);
        Assert.Null(statusDoDesafiante.NumeroDesafiante);
        Assert.Null(statusDoDesafiante.VencedorParImparLinha);
    }

    [Fact]
    public void SubmitLineDrawNumber_DeveInicializarTimesEDisponiveisAposFecharSorteio()
    {
        using var harness = CriarHarness();
        var contexto = harness.Contexto;
        var (_, partida, capitao, desafiante) = SeedDesafioPronto(contexto);
        var service = new MatchService(contexto, new FakeInviteEmailService());

        service.StartLineDraw(capitao.IdUsuario, partida.IdPartida, new IniciarParImparLinhaDTO
        {
            EscolhaParidade = "PAR"
        });

        service.SubmitLineDrawNumber(capitao.IdUsuario, partida.IdPartida, new RegistrarNumeroParImparLinhaDTO
        {
            Numero = 2
        });

        var status = service.SubmitLineDrawNumber(desafiante.IdUsuario, partida.IdPartida, new RegistrarNumeroParImparLinhaDTO
        {
            Numero = 1
        });

        Assert.Equal("ESCOLHA_EM_ANDAMENTO", status.StatusDesafio);
        Assert.NotNull(status.TimeCapitaoAtual);
        Assert.NotNull(status.TimeDesafiante);
        Assert.Contains(status.TimeCapitaoAtual!.Jogadores, jogador => jogador.IdUsuario == capitao.IdUsuario);
        Assert.Contains(status.TimeDesafiante!.Jogadores, jogador => jogador.IdUsuario == desafiante.IdUsuario);
        Assert.Equal(8, status.JogadoresLinhaDisponiveis.Count);
    }

    [Fact]
    public void PickLinePlayer_DeveEscolherJogadorEAlternarTurno()
    {
        using var harness = CriarHarness();
        var contexto = harness.Contexto;
        var (_, partida, capitao, desafiante) = SeedDesafioPronto(contexto);
        var service = new MatchService(contexto, new FakeInviteEmailService());

        service.StartLineDraw(capitao.IdUsuario, partida.IdPartida, new IniciarParImparLinhaDTO
        {
            EscolhaParidade = "PAR"
        });

        service.SubmitLineDrawNumber(capitao.IdUsuario, partida.IdPartida, new RegistrarNumeroParImparLinhaDTO
        {
            Numero = 4
        });

        service.SubmitLineDrawNumber(desafiante.IdUsuario, partida.IdPartida, new RegistrarNumeroParImparLinhaDTO
        {
            Numero = 3
        });

        var status = service.PickLinePlayer(desafiante.IdUsuario, partida.IdPartida, new EscolherJogadorLinhaDTO
        {
            IdUsuarioJogador = 5
        });

        Assert.Equal("ESCOLHA_EM_ANDAMENTO", status.StatusDesafio);
        Assert.NotNull(status.TimeDesafiante);
        Assert.Contains(status.TimeDesafiante!.Jogadores, jogador => jogador.IdUsuario == 5);
        Assert.NotNull(status.ProximoCapitaoEscolha);
        Assert.Equal(capitao.IdUsuario, (ulong)status.ProximoCapitaoEscolha!.IdUsuario);
        Assert.True(status.JogadoresLinhaDisponiveis.All(jogador => jogador.IdUsuario != 5));
    }

    [Fact]
    public void PickLinePlayer_DeveBloquearCapitaoForaDaVez()
    {
        using var harness = CriarHarness();
        var contexto = harness.Contexto;
        var (_, partida, capitao, desafiante) = SeedDesafioPronto(contexto);
        var service = new MatchService(contexto, new FakeInviteEmailService());

        service.StartLineDraw(capitao.IdUsuario, partida.IdPartida, new IniciarParImparLinhaDTO
        {
            EscolhaParidade = "PAR"
        });

        service.SubmitLineDrawNumber(capitao.IdUsuario, partida.IdPartida, new RegistrarNumeroParImparLinhaDTO
        {
            Numero = 4
        });

        service.SubmitLineDrawNumber(desafiante.IdUsuario, partida.IdPartida, new RegistrarNumeroParImparLinhaDTO
        {
            Numero = 3
        });

        var ex = Assert.Throws<Exception>(() => service.PickLinePlayer(capitao.IdUsuario, partida.IdPartida, new EscolherJogadorLinhaDTO
        {
            IdUsuarioJogador = 5
        }));

        Assert.Equal("Não é a sua vez de escolher.", ex.Message);
    }

    [Fact]
    public void StartGoalkeeperDraw_DeveReaproveitarParidadeDosJogadores()
    {
        using var harness = CriarHarness();
        var contexto = harness.Contexto;
        var (_, partida, capitao, _) = SeedDesafioProntoParaGoleiros(contexto);
        var service = new MatchService(contexto, new FakeInviteEmailService());

        contexto.DesafiosPartida.First(d => d.IdPartida == partida.IdPartida).EscolhaParidadeCapitaoAtual = "IMPAR";
        contexto.SaveChanges();

        var status = service.StartGoalkeeperDraw(capitao.IdUsuario, partida.IdPartida, new IniciarParImparGoleiroDTO
        {
            EscolhaParidade = "PAR"
        });

        Assert.Equal("PAR_IMPAR_GOLEIROS", status.StatusDesafio);
        Assert.Equal("IMPAR", status.ParidadeCapitaoAtualGoleiro);
        Assert.Equal("PAR", status.ParidadeDesafianteGoleiro);
    }

    [Fact]
    public void SubmitGoalkeeperDrawNumber_DeveDefinirVencedorDoSorteioDosGoleiros()
    {
        using var harness = CriarHarness();
        var contexto = harness.Contexto;
        var (_, partida, capitao, desafiante) = SeedDesafioProntoParaGoleiros(contexto);
        var service = new MatchService(contexto, new FakeInviteEmailService());

        contexto.DesafiosPartida.First(d => d.IdPartida == partida.IdPartida).EscolhaParidadeCapitaoAtual = "PAR";
        contexto.SaveChanges();

        service.StartGoalkeeperDraw(capitao.IdUsuario, partida.IdPartida, new IniciarParImparGoleiroDTO
        {
            EscolhaParidade = "IMPAR"
        });

        service.SubmitGoalkeeperDrawNumber(capitao.IdUsuario, partida.IdPartida, new RegistrarNumeroParImparGoleiroDTO
        {
            Numero = 6
        });

        var status = service.SubmitGoalkeeperDrawNumber(desafiante.IdUsuario, partida.IdPartida, new RegistrarNumeroParImparGoleiroDTO
        {
            Numero = 3
        });

        Assert.Equal("ESCOLHA_GOLEIRO_EM_ANDAMENTO", status.StatusDesafio);
        Assert.Equal(9, status.SomaParImparGoleiro);
        Assert.NotNull(status.VencedorParImparGoleiro);
        Assert.Equal(desafiante.IdUsuario, (ulong)status.VencedorParImparGoleiro!.IdUsuario);
        Assert.Equal(desafiante.IdUsuario, (ulong)status.ProximoCapitaoEscolhaGoleiro!.IdUsuario);
        Assert.Equal(2, status.GoleirosDisponiveis.Count);
    }

    [Fact]
    public void SubmitGoalkeeperDrawNumber_DeveReaproveitarParidadePrincipalMesmoSemCampoDosGoleirosPreenchido()
    {
        using var harness = CriarHarness();
        var contexto = harness.Contexto;
        var (_, partida, capitao, desafiante) = SeedDesafioProntoParaGoleiros(contexto);
        var service = new MatchService(contexto, new FakeInviteEmailService());

        var desafio = contexto.DesafiosPartida.First(d => d.IdPartida == partida.IdPartida);
        desafio.EscolhaParidadeCapitaoAtual = "PAR";
        desafio.EscolhaParidadeGoleiroCapitaoAtual = null;
        contexto.SaveChanges();

        service.SubmitGoalkeeperDrawNumber(capitao.IdUsuario, partida.IdPartida, new RegistrarNumeroParImparGoleiroDTO
        {
            Numero = 6
        });

        var status = service.SubmitGoalkeeperDrawNumber(desafiante.IdUsuario, partida.IdPartida, new RegistrarNumeroParImparGoleiroDTO
        {
            Numero = 3
        });

        Assert.Equal("ESCOLHA_GOLEIRO_EM_ANDAMENTO", status.StatusDesafio);
        Assert.Equal("PAR", status.ParidadeCapitaoAtualGoleiro);
        Assert.Equal(desafiante.IdUsuario, (ulong)status.VencedorParImparGoleiro!.IdUsuario);
    }

    [Fact]
    public void PickGoalkeeper_DeveAtribuirOsDoisGoleirosEFecharTimes()
    {
        using var harness = CriarHarness();
        var contexto = harness.Contexto;
        var (_, partida, capitao, desafiante) = SeedDesafioProntoParaGoleiros(contexto);
        var service = new MatchService(contexto, new FakeInviteEmailService());

        contexto.DesafiosPartida.First(d => d.IdPartida == partida.IdPartida).EscolhaParidadeCapitaoAtual = "PAR";
        contexto.SaveChanges();

        service.StartGoalkeeperDraw(capitao.IdUsuario, partida.IdPartida, new IniciarParImparGoleiroDTO
        {
            EscolhaParidade = "IMPAR"
        });

        service.SubmitGoalkeeperDrawNumber(capitao.IdUsuario, partida.IdPartida, new RegistrarNumeroParImparGoleiroDTO
        {
            Numero = 4
        });

        service.SubmitGoalkeeperDrawNumber(desafiante.IdUsuario, partida.IdPartida, new RegistrarNumeroParImparGoleiroDTO
        {
            Numero = 3
        });

        var status = service.PickGoalkeeper(desafiante.IdUsuario, partida.IdPartida, new EscolherGoleiroDTO
        {
            IdUsuarioGoleiro = 3
        });

        Assert.Equal("TIMES_FECHADOS", status.StatusDesafio);
        Assert.NotNull(status.TimeDesafiante);
        Assert.NotNull(status.TimeCapitaoAtual);
        Assert.Contains(status.TimeDesafiante!.Jogadores, jogador => jogador.IdUsuario == 3);
        Assert.Contains(status.TimeCapitaoAtual!.Jogadores, jogador => jogador.IdUsuario == 4);
        Assert.Empty(status.GoleirosDisponiveis);
    }

    [Fact]
    public void DeleteMatch_DeveZerarDesafianteAtualESemEncerrarOCiclo()
    {
        using var harness = CriarHarness();
        var agoraBrasilia = ObterAgoraBrasilia();
        var contexto = harness.Contexto;

        var grupo = CriarGrupo(contexto, 40, 99);
        var admin = CriarUsuario(contexto, 99, "Admin", false);
        var capitao = CriarUsuario(contexto, 1, "Capitao", false);
        var desafiante = CriarUsuario(contexto, 2, "Desafiante", false);

        VincularMembro(contexto, grupo.IdGrupo, admin.IdUsuario, "ADMIN");
        VincularMembro(contexto, grupo.IdGrupo, capitao.IdUsuario);
        VincularMembro(contexto, grupo.IdGrupo, desafiante.IdUsuario);

        var temporada = CriarTemporada(contexto, grupo.IdGrupo, 40);
        var ciclo = new CicloCapitao
        {
            IdCiclo = 40,
            IdGrupo = grupo.IdGrupo,
            IdTemporada = temporada.IdTemporada,
            IdCapitaoAtual = capitao.IdUsuario,
            IdDesafianteAtual = desafiante.IdUsuario,
            Status = "ATIVO"
        };
        contexto.CiclosCapitao.Add(ciclo);

        var partida = CriarPartida(contexto, 40, grupo.IdGrupo, temporada.IdTemporada, agoraBrasilia.AddHours(3), admin.IdUsuario);
        partida.IdCicloCapitao = ciclo.IdCiclo;
        contexto.DesafiosPartida.Add(new DesafioPartida
        {
            IdDesafio = 40,
            IdPartida = partida.IdPartida,
            IdCapitaoAtual = capitao.IdUsuario,
            IdDesafiante = desafiante.IdUsuario,
            StatusFluxo = "PRONTA_PARA_MONTAGEM"
        });
        contexto.SaveChanges();

        var service = new MatchService(contexto, new FakeInviteEmailService());
        service.DeleteMatch(admin.IdUsuario, partida.IdPartida);

        var cicloAtualizado = contexto.CiclosCapitao.First(c => c.IdCiclo == ciclo.IdCiclo);
        Assert.Null(cicloAtualizado.IdDesafianteAtual);
        Assert.Equal("ATIVO", cicloAtualizado.Status);
        Assert.False(contexto.Partidas.Any(p => p.IdPartida == partida.IdPartida));
    }

    [Fact]
    public void GetChallengeStatus_DeveRetomarEscolhaDeLinhaQuandoEntraremNovosJogadores()
    {
        using var harness = CriarHarness();
        var contexto = harness.Contexto;
        var (_, partida, capitao, desafiante) = SeedDesafioProntoParaGoleiros(contexto);
        var service = new MatchService(contexto, new FakeInviteEmailService());

        contexto.DesafiosPartida.First(d => d.IdPartida == partida.IdPartida).EscolhaParidadeCapitaoAtual = "PAR";
        contexto.SaveChanges();

        service.StartGoalkeeperDraw(capitao.IdUsuario, partida.IdPartida, new IniciarParImparGoleiroDTO
        {
            EscolhaParidade = "IMPAR"
        });

        service.SubmitGoalkeeperDrawNumber(capitao.IdUsuario, partida.IdPartida, new RegistrarNumeroParImparGoleiroDTO
        {
            Numero = 4
        });

        service.SubmitGoalkeeperDrawNumber(desafiante.IdUsuario, partida.IdPartida, new RegistrarNumeroParImparGoleiroDTO
        {
            Numero = 3
        });

        service.PickGoalkeeper(desafiante.IdUsuario, partida.IdPartida, new EscolherGoleiroDTO
        {
            IdUsuarioGoleiro = 3
        });

        foreach (var idUsuario in new ulong[] { 13, 14, 15 })
        {
            var jogador = CriarUsuario(contexto, idUsuario, $"Extra {idUsuario}", false);
            VincularMembro(contexto, 10, jogador.IdUsuario);
            ConfirmarPresenca(contexto, partida.IdPartida, jogador.IdUsuario);
        }

        contexto.SaveChanges();

        var status = service.GetChallengeStatus(capitao.IdUsuario, partida.IdPartida);

        Assert.Equal("ESCOLHA_EM_ANDAMENTO", status.StatusDesafio);
        Assert.Equal(capitao.IdUsuario, (ulong)status.ProximoCapitaoEscolha!.IdUsuario);
        Assert.Equal(3, status.JogadoresLinhaDisponiveis.Count);
        Assert.True(status.UsuarioPodeEscolherJogadorLinha);
    }

    [Fact]
    public void PickLinePlayer_DeveFecharTimesQuandoNaoRestaremLinhasNemGoleirosDisponiveis()
    {
        using var harness = CriarHarness();
        var contexto = harness.Contexto;
        var (_, partida, capitao, desafiante) = SeedDesafioProntoParaGoleiros(contexto);
        var service = new MatchService(contexto, new FakeInviteEmailService());

        contexto.DesafiosPartida.First(d => d.IdPartida == partida.IdPartida).EscolhaParidadeCapitaoAtual = "PAR";
        contexto.SaveChanges();

        service.StartGoalkeeperDraw(capitao.IdUsuario, partida.IdPartida, new IniciarParImparGoleiroDTO
        {
            EscolhaParidade = "IMPAR"
        });

        service.SubmitGoalkeeperDrawNumber(capitao.IdUsuario, partida.IdPartida, new RegistrarNumeroParImparGoleiroDTO
        {
            Numero = 4
        });

        service.SubmitGoalkeeperDrawNumber(desafiante.IdUsuario, partida.IdPartida, new RegistrarNumeroParImparGoleiroDTO
        {
            Numero = 3
        });

        service.PickGoalkeeper(desafiante.IdUsuario, partida.IdPartida, new EscolherGoleiroDTO
        {
            IdUsuarioGoleiro = 3
        });

        foreach (var idUsuario in new ulong[] { 13, 14, 15 })
        {
            var jogador = CriarUsuario(contexto, idUsuario, $"Extra {idUsuario}", false);
            VincularMembro(contexto, 10, jogador.IdUsuario);
            ConfirmarPresenca(contexto, partida.IdPartida, jogador.IdUsuario);
        }

        contexto.SaveChanges();

        var statusInicial = service.GetChallengeStatus(capitao.IdUsuario, partida.IdPartida);
        Assert.Equal("ESCOLHA_EM_ANDAMENTO", statusInicial.StatusDesafio);

        var statusAposPrimeira = service.PickLinePlayer(capitao.IdUsuario, partida.IdPartida, new EscolherJogadorLinhaDTO
        {
            IdUsuarioJogador = 13
        });
        Assert.Equal(desafiante.IdUsuario, (ulong)statusAposPrimeira.ProximoCapitaoEscolha!.IdUsuario);

        var statusAposSegunda = service.PickLinePlayer(desafiante.IdUsuario, partida.IdPartida, new EscolherJogadorLinhaDTO
        {
            IdUsuarioJogador = 14
        });
        Assert.Equal(capitao.IdUsuario, (ulong)statusAposSegunda.ProximoCapitaoEscolha!.IdUsuario);

        var statusFinal = service.PickLinePlayer(capitao.IdUsuario, partida.IdPartida, new EscolherJogadorLinhaDTO
        {
            IdUsuarioJogador = 15
        });

        Assert.Equal("TIMES_FECHADOS", statusFinal.StatusDesafio);
        Assert.Empty(statusFinal.JogadoresLinhaDisponiveis);
        Assert.Empty(statusFinal.GoleirosDisponiveis);
    }

    private static (Grupo grupo, Partida partida, Usuario capitao, Usuario desafiante) SeedDesafioPronto(ResenhaDbContext contexto)
    {
        var agoraBrasilia = ObterAgoraBrasilia();
        var grupo = CriarGrupo(contexto, 10, 99);
        var admin = CriarUsuario(contexto, 99, "Admin", false);
        var capitao = CriarUsuario(contexto, 1, "Capitao", false);
        var desafiante = CriarUsuario(contexto, 2, "Desafiante", false);
        var goleiro = CriarUsuario(contexto, 3, "Goleiro", true);
        var goleiro2 = CriarUsuario(contexto, 4, "Goleiro 2", true);

        VincularMembro(contexto, grupo.IdGrupo, admin.IdUsuario, "ADMIN");
        VincularMembro(contexto, grupo.IdGrupo, capitao.IdUsuario);
        VincularMembro(contexto, grupo.IdGrupo, desafiante.IdUsuario);
        VincularMembro(contexto, grupo.IdGrupo, goleiro.IdUsuario);
        VincularMembro(contexto, grupo.IdGrupo, goleiro2.IdUsuario);

        for (ulong i = 5; i <= 12; i++)
        {
            var jogador = CriarUsuario(contexto, i, $"Jogador {i}", false);
            VincularMembro(contexto, grupo.IdGrupo, jogador.IdUsuario);
        }

        var temporada = CriarTemporada(contexto, grupo.IdGrupo, 10);
        var ciclo = new CicloCapitao
        {
            IdCiclo = 1,
            IdGrupo = grupo.IdGrupo,
            IdTemporada = temporada.IdTemporada,
            IdCapitaoAtual = capitao.IdUsuario,
            IdDesafianteAtual = desafiante.IdUsuario,
            Status = "ATIVO"
        };
        contexto.CiclosCapitao.Add(ciclo);

        var partida = CriarPartida(contexto, 20, grupo.IdGrupo, temporada.IdTemporada, agoraBrasilia.AddHours(3), admin.IdUsuario);
        partida.IdCicloCapitao = ciclo.IdCiclo;

        contexto.DesafiosPartida.Add(new DesafioPartida
        {
            IdDesafio = 1,
            IdPartida = partida.IdPartida,
            IdCapitaoAtual = capitao.IdUsuario,
            IdDesafiante = desafiante.IdUsuario,
            StatusFluxo = "PRONTA_PARA_MONTAGEM"
        });

        for (ulong i = 1; i <= 12; i++)
        {
            ConfirmarPresenca(contexto, partida.IdPartida, i);
        }

        contexto.SaveChanges();
        return (grupo, partida, capitao, desafiante);
    }

    private static (Grupo grupo, Partida partida, Usuario capitao, Usuario desafiante) SeedDesafioProntoParaGoleiros(ResenhaDbContext contexto)
    {
        var seed = SeedDesafioPronto(contexto);
        var partida = seed.partida;

        var timeCapitao = new TimePartida
        {
            IdTime = 101,
            IdPartida = partida.IdPartida,
            NumeroTime = 1,
            IdCapitao = seed.capitao.IdUsuario
        };

        var timeDesafiante = new TimePartida
        {
            IdTime = 102,
            IdPartida = partida.IdPartida,
            NumeroTime = 2,
            IdCapitao = seed.desafiante.IdUsuario
        };

        contexto.TimesPartida.Add(timeCapitao);
        contexto.TimesPartida.Add(timeDesafiante);
        contexto.SaveChanges();

        contexto.JogadoresTimePartida.Add(new JogadorTimePartida
        {
            IdTime = timeCapitao.IdTime,
            IdUsuario = seed.capitao.IdUsuario
        });

        contexto.JogadoresTimePartida.Add(new JogadorTimePartida
        {
            IdTime = timeDesafiante.IdTime,
            IdUsuario = seed.desafiante.IdUsuario
        });

        foreach (var idUsuario in new ulong[] { 5, 7, 9, 11 })
        {
            contexto.JogadoresTimePartida.Add(new JogadorTimePartida
            {
                IdTime = timeCapitao.IdTime,
                IdUsuario = idUsuario
            });
        }

        foreach (var idUsuario in new ulong[] { 6, 8, 10, 12 })
        {
            contexto.JogadoresTimePartida.Add(new JogadorTimePartida
            {
                IdTime = timeDesafiante.IdTime,
                IdUsuario = idUsuario
            });
        }

        var desafio = contexto.DesafiosPartida.First(d => d.IdPartida == partida.IdPartida);
        desafio.StatusFluxo = "PAR_IMPAR_GOLEIROS";
        desafio.IdProximoCapitaoEscolha = null;
        contexto.SaveChanges();

        return seed;
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

    private static Usuario CriarUsuario(ResenhaDbContext contexto, ulong idUsuario, string nome, bool goleiro)
    {
        var usuario = new Usuario
        {
            IdUsuario = idUsuario,
            Nome = nome,
            Email = $"{nome.Replace(" ", string.Empty).ToLowerInvariant()}@teste.com",
            SenhaHash = "hash",
            Goleiro = goleiro,
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

    private static DateTime ObterAgoraBrasilia()
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

    private sealed class FakeInviteEmailService : IInviteEmailService
    {
        public int MatchSlotReopenedCalls { get; private set; }

        public InviteSendResult SendGroupInvite(string toEmail, string inviterName, string groupName, string inviteLink, DateTime expiresAtUtc)
            => new() { Sent = true, Configured = true, Provider = "fake" };

        public InviteSendResult SendPasswordReset(string toEmail, string userName, string resetLink, DateTime expiresAtUtc)
            => new() { Sent = true, Configured = true, Provider = "fake" };

        public InviteSendResult SendMatchSlotReopened(string toEmail, string userName, string groupName, string playerWhoLeft, DateTime matchDateTimeLocal)
        {
            MatchSlotReopenedCalls++;
            return new() { Sent = true, Configured = true, Provider = "fake" };
        }
    }

    private static TestHarness CriarHarness() => new();
}
