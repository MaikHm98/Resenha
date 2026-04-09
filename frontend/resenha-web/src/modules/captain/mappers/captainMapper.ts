import type {
  CaptainHistory,
  CaptainHistoryApiResponse,
  CaptainPlayerSummary,
  CaptainPlayerSummaryApiResponse,
  CaptainStatus,
  CaptainStatusApiResponse,
} from '../types/captainContracts'

export function mapCaptainPlayerSummaryApiToCaptainPlayerSummary(
  payload: CaptainPlayerSummaryApiResponse,
): CaptainPlayerSummary {
  return {
    idUsuario: payload.idUsuario,
    nome: payload.nome,
  }
}

export function mapCaptainHistoryApiToCaptainHistory(
  payload: CaptainHistoryApiResponse,
): CaptainHistory {
  return {
    idHistorico: payload.idHistorico,
    idPartida: payload.idPartida,
    idCapitao: payload.idCapitao,
    nomeCapitao: payload.nomeCapitao,
    idDesafiante: payload.idDesafiante,
    nomeDesafiante: payload.nomeDesafiante,
    idVencedor: payload.idVencedor,
    nomeVencedor: payload.nomeVencedor,
    idDerrotado: payload.idDerrotado,
    nomeDerrotado: payload.nomeDerrotado,
    resultado: payload.resultado,
    registradoEm: payload.registradoEm,
  }
}

export function mapCaptainStatusApiToCaptainStatus(
  payload: CaptainStatusApiResponse,
): CaptainStatus {
  return {
    idCiclo: payload.idCiclo,
    idCapitao: payload.idCapitao,
    nomeCapitao: payload.nomeCapitao,
    idDesafiante: payload.idDesafiante,
    nomeDesafiante: payload.nomeDesafiante,
    bloqueados: payload.bloqueados.map(
      mapCaptainPlayerSummaryApiToCaptainPlayerSummary,
    ),
    historico: payload.historico.map(mapCaptainHistoryApiToCaptainHistory),
    status: payload.status,
    iniciadoEm: payload.iniciadoEm,
  }
}
