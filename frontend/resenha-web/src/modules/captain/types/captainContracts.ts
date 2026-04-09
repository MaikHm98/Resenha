export const CAPTAIN_CYCLE_STATUS_VALUES = ['ATIVO', 'ENCERRADO'] as const
export type CaptainCycleStatus = (typeof CAPTAIN_CYCLE_STATUS_VALUES)[number]

export const CAPTAIN_CHALLENGE_RESULT_VALUES = [
  'CAPITAO',
  'DESAFIANTE',
] as const
export type CaptainChallengeResult =
  (typeof CAPTAIN_CHALLENGE_RESULT_VALUES)[number]

export type CaptainPlayerSummaryApiResponse = {
  idUsuario: number
  nome: string
}

export type CaptainHistoryApiResponse = {
  idHistorico: number
  idPartida: number
  idCapitao: number
  nomeCapitao: string
  idDesafiante: number
  nomeDesafiante: string
  idVencedor: number
  nomeVencedor: string
  idDerrotado: number
  nomeDerrotado: string
  resultado: CaptainChallengeResult
  registradoEm: string
}

export type CaptainStatusApiResponse = {
  idCiclo: number
  idCapitao: number
  nomeCapitao: string
  idDesafiante: number | null
  nomeDesafiante: string | null
  bloqueados: CaptainPlayerSummaryApiResponse[]
  historico: CaptainHistoryApiResponse[]
  status: CaptainCycleStatus
  iniciadoEm: string
}

export type LaunchCaptainChallengeInput = {
  idDesafiante: number
  idPartida: number
}

export type RegisterCaptainChallengeResultInput = {
  resultado: CaptainChallengeResult
}

export type CaptainPlayerSummary = {
  idUsuario: number
  nome: string
}

export type CaptainHistory = {
  idHistorico: number
  idPartida: number
  idCapitao: number
  nomeCapitao: string
  idDesafiante: number
  nomeDesafiante: string
  idVencedor: number
  nomeVencedor: string
  idDerrotado: number
  nomeDerrotado: string
  resultado: CaptainChallengeResult
  registradoEm: string
}

export type CaptainStatus = {
  idCiclo: number
  idCapitao: number
  nomeCapitao: string
  idDesafiante: number | null
  nomeDesafiante: string | null
  bloqueados: CaptainPlayerSummary[]
  historico: CaptainHistory[]
  status: CaptainCycleStatus
  iniciadoEm: string
}
