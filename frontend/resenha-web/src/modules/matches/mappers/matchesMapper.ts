import type {
  Match,
  MatchApiResponse,
  MatchAwardDetail,
  MatchAwardDetailApiResponse,
  MatchConfirmedInfo,
  MatchConfirmedInfoApiResponse,
  MatchDetail,
  MatchDetailApiResponse,
  MatchPlayerDetail,
  MatchPlayerDetailApiResponse,
  MatchPresenceApiResponse,
  MatchPresenceResult,
  MatchTeamDetail,
  MatchTeamDetailApiResponse,
  MessageApiResponse,
  MessageResult,
} from '../types/matchesContracts'

export function mapMatchConfirmedInfoApiToMatchConfirmedInfo(
  payload: MatchConfirmedInfoApiResponse,
): MatchConfirmedInfo {
  return {
    nome: payload.nome,
    goleiro: payload.goleiro,
  }
}

export function mapMatchApiToMatch(payload: MatchApiResponse): Match {
  return {
    idPartida: payload.idPartida,
    idGrupo: payload.idGrupo,
    idTemporada: payload.idTemporada,
    dataHoraJogo: payload.dataHoraJogo,
    status: payload.status,
    observacao: payload.observacao,
    totalConfirmados: payload.totalConfirmados,
    limiteVagas: payload.limiteVagas,
    limiteCheio: payload.limiteCheio,
    usuarioConfirmado: payload.usuarioConfirmado,
    usuarioAusente: payload.usuarioAusente,
    confirmados: payload.confirmados.map(
      mapMatchConfirmedInfoApiToMatchConfirmedInfo,
    ),
    ausentesNomes: payload.ausentesNomes,
    naoConfirmaramNomes: payload.naoConfirmaramNomes,
    nomeCapitaoVencedor: payload.nomeCapitaoVencedor,
    jogadoresVencedores: payload.jogadoresVencedores,
    criadoEm: payload.criadoEm,
  }
}

export function mapMatchPlayerDetailApiToMatchPlayerDetail(
  payload: MatchPlayerDetailApiResponse,
): MatchPlayerDetail {
  return {
    idUsuario: payload.idUsuario,
    nome: payload.nome,
    goleiro: payload.goleiro,
    gols: payload.gols,
    assistencias: payload.assistencias,
  }
}

export function mapMatchTeamDetailApiToMatchTeamDetail(
  payload: MatchTeamDetailApiResponse,
): MatchTeamDetail {
  return {
    numeroTime: payload.numeroTime,
    idCapitao: payload.idCapitao,
    nomeCapitao: payload.nomeCapitao,
    jogadores: payload.jogadores.map(mapMatchPlayerDetailApiToMatchPlayerDetail),
  }
}

export function mapMatchAwardDetailApiToMatchAwardDetail(
  payload: MatchAwardDetailApiResponse,
): MatchAwardDetail {
  return {
    tipo: payload.tipo,
    status: payload.status,
    rodada: payload.rodada,
    idVencedor: payload.idVencedor,
    nomeVencedor: payload.nomeVencedor,
  }
}

export function mapMatchDetailApiToMatchDetail(
  payload: MatchDetailApiResponse,
): MatchDetail {
  return {
    idPartida: payload.idPartida,
    idGrupo: payload.idGrupo,
    dataHoraJogo: payload.dataHoraJogo,
    status: payload.status,
    observacao: payload.observacao,
    limiteVagas: payload.limiteVagas,
    totalConfirmados: payload.totalConfirmados,
    totalAusentes: payload.totalAusentes,
    golsTime1: payload.golsTime1,
    golsTime2: payload.golsTime2,
    numeroTimeVencedor: payload.numeroTimeVencedor,
    nomeCapitaoVencedor: payload.nomeCapitaoVencedor,
    time1: payload.time1
      ? mapMatchTeamDetailApiToMatchTeamDetail(payload.time1)
      : null,
    time2: payload.time2
      ? mapMatchTeamDetailApiToMatchTeamDetail(payload.time2)
      : null,
    confirmadosNomes: payload.confirmadosNomes,
    ausentesNomes: payload.ausentesNomes,
    naoConfirmaramNomes: payload.naoConfirmaramNomes,
    premios: payload.premios.map(mapMatchAwardDetailApiToMatchAwardDetail),
  }
}

export function mapMatchPresenceApiToMatchPresenceResult(
  payload: MatchPresenceApiResponse,
): MatchPresenceResult {
  return {
    idPartida: payload.idPartida,
    status: payload.status,
    totalConfirmados: payload.totalConfirmados,
    limiteVagas: payload.limiteVagas,
  }
}

export function mapMessageApiToMessageResult(
  payload: MessageApiResponse,
): MessageResult {
  return {
    mensagem: payload.mensagem,
  }
}
