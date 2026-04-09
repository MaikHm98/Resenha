import type {
  MatchChallengeCaptain,
  MatchChallengeCaptainApiResponse,
  MatchChallengePlayer,
  MatchChallengePlayerApiResponse,
  MatchChallengeStatus,
  MatchChallengeStatusApiResponse,
  MatchChallengeTeam,
  MatchChallengeTeamApiResponse,
} from '../types/challengeContracts'

export function mapMatchChallengeCaptainApiToMatchChallengeCaptain(
  payload: MatchChallengeCaptainApiResponse,
): MatchChallengeCaptain {
  return {
    idUsuario: payload.idUsuario,
    nome: payload.nome,
  }
}

export function mapMatchChallengePlayerApiToMatchChallengePlayer(
  payload: MatchChallengePlayerApiResponse,
): MatchChallengePlayer {
  return {
    idUsuario: payload.idUsuario,
    nome: payload.nome,
    goleiro: payload.goleiro,
  }
}

export function mapMatchChallengeTeamApiToMatchChallengeTeam(
  payload: MatchChallengeTeamApiResponse,
): MatchChallengeTeam {
  return {
    numeroTime: payload.numeroTime,
    idCapitao: payload.idCapitao,
    nomeCapitao: payload.nomeCapitao,
    jogadores: payload.jogadores.map(mapMatchChallengePlayerApiToMatchChallengePlayer),
  }
}

export function mapMatchChallengeStatusApiToMatchChallengeStatus(
  payload: MatchChallengeStatusApiResponse,
): MatchChallengeStatus {
  return {
    idPartida: payload.idPartida,
    idGrupo: payload.idGrupo,
    dataHoraJogo: payload.dataHoraJogo,
    statusPartida: payload.statusPartida,
    statusDesafio: payload.statusDesafio,
    totalConfirmados: payload.totalConfirmados,
    minimoConfirmados: payload.minimoConfirmados,
    goleirosConfirmados: payload.goleirosConfirmados,
    maximoGoleiros: payload.maximoGoleiros,
    horarioLimiteConfirmacao: payload.horarioLimiteConfirmacao,
    confirmacoesEncerradas: payload.confirmacoesEncerradas,
    podeIniciarMontagem: payload.podeIniciarMontagem,
    usuarioEhCapitao: payload.usuarioEhCapitao,
    usuarioEhCapitaoAtual: payload.usuarioEhCapitaoAtual,
    usuarioEhDesafiante: payload.usuarioEhDesafiante,
    usuarioPodeInteragir: payload.usuarioPodeInteragir,
    usuarioPodeEscolherParidade: payload.usuarioPodeEscolherParidade,
    usuarioPodeInformarNumero: payload.usuarioPodeInformarNumero,
    usuarioPodeEscolherJogadorLinha: payload.usuarioPodeEscolherJogadorLinha,
    usuarioPodeEscolherParidadeGoleiro: payload.usuarioPodeEscolherParidadeGoleiro,
    usuarioPodeInformarNumeroGoleiro: payload.usuarioPodeInformarNumeroGoleiro,
    usuarioPodeEscolherGoleiro: payload.usuarioPodeEscolherGoleiro,
    possuiDesafianteDefinido: payload.possuiDesafianteDefinido,
    requerDefinicaoManualGoleiro: payload.requerDefinicaoManualGoleiro,
    paridadeCapitaoAtual: payload.paridadeCapitaoAtual,
    paridadeDesafiante: payload.paridadeDesafiante,
    capitaoAtualJaInformouNumero: payload.capitaoAtualJaInformouNumero,
    desafianteJaInformouNumero: payload.desafianteJaInformouNumero,
    numeroCapitaoAtual: payload.numeroCapitaoAtual,
    numeroDesafiante: payload.numeroDesafiante,
    somaParImparLinha: payload.somaParImparLinha,
    paridadeCapitaoAtualGoleiro: payload.paridadeCapitaoAtualGoleiro,
    paridadeDesafianteGoleiro: payload.paridadeDesafianteGoleiro,
    capitaoAtualJaInformouNumeroGoleiro: payload.capitaoAtualJaInformouNumeroGoleiro,
    desafianteJaInformouNumeroGoleiro:
      payload.desafianteJaInformouNumeroGoleiro,
    numeroCapitaoAtualGoleiro: payload.numeroCapitaoAtualGoleiro,
    numeroDesafianteGoleiro: payload.numeroDesafianteGoleiro,
    somaParImparGoleiro: payload.somaParImparGoleiro,
    alertas: payload.alertas,
    bloqueios: payload.bloqueios,
    capitaoAtual: payload.capitaoAtual
      ? mapMatchChallengeCaptainApiToMatchChallengeCaptain(payload.capitaoAtual)
      : null,
    desafiante: payload.desafiante
      ? mapMatchChallengeCaptainApiToMatchChallengeCaptain(payload.desafiante)
      : null,
    vencedorParImparLinha: payload.vencedorParImparLinha
      ? mapMatchChallengeCaptainApiToMatchChallengeCaptain(
          payload.vencedorParImparLinha,
        )
      : null,
    proximoCapitaoEscolha: payload.proximoCapitaoEscolha
      ? mapMatchChallengeCaptainApiToMatchChallengeCaptain(
          payload.proximoCapitaoEscolha,
        )
      : null,
    vencedorParImparGoleiro: payload.vencedorParImparGoleiro
      ? mapMatchChallengeCaptainApiToMatchChallengeCaptain(
          payload.vencedorParImparGoleiro,
        )
      : null,
    proximoCapitaoEscolhaGoleiro: payload.proximoCapitaoEscolhaGoleiro
      ? mapMatchChallengeCaptainApiToMatchChallengeCaptain(
          payload.proximoCapitaoEscolhaGoleiro,
        )
      : null,
    timeCapitaoAtual: payload.timeCapitaoAtual
      ? mapMatchChallengeTeamApiToMatchChallengeTeam(payload.timeCapitaoAtual)
      : null,
    timeDesafiante: payload.timeDesafiante
      ? mapMatchChallengeTeamApiToMatchChallengeTeam(payload.timeDesafiante)
      : null,
    jogadoresLinhaDisponiveis: payload.jogadoresLinhaDisponiveis.map(
      mapMatchChallengePlayerApiToMatchChallengePlayer,
    ),
    goleirosDisponiveis: payload.goleirosDisponiveis.map(
      mapMatchChallengePlayerApiToMatchChallengePlayer,
    ),
  }
}
