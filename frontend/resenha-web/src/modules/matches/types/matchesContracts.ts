export const MATCH_STATUS_VALUES = [
  'ABERTA',
  'EM_ANDAMENTO',
  'FINALIZADA',
  'CANCELADA',
] as const
export type MatchStatus = (typeof MATCH_STATUS_VALUES)[number]

export const MATCH_PRESENCE_STATUS_VALUES = [
  'CONFIRMADO',
  'AUSENTE',
  'CANCELADO',
] as const
export type MatchPresenceStatus =
  (typeof MATCH_PRESENCE_STATUS_VALUES)[number]

export type MatchConfirmedInfoApiResponse = {
  nome: string
  goleiro: boolean
}

export type MatchApiResponse = {
  idPartida: number
  idGrupo: number
  idTemporada: number
  dataHoraJogo: string
  status: MatchStatus
  observacao: string | null
  totalConfirmados: number
  limiteVagas: number
  limiteCheio: boolean
  usuarioConfirmado: boolean
  usuarioAusente: boolean
  confirmados: MatchConfirmedInfoApiResponse[]
  ausentesNomes: string[]
  naoConfirmaramNomes: string[]
  nomeCapitaoVencedor: string | null
  jogadoresVencedores: string[]
  criadoEm: string
}

export type MatchPlayerDetailApiResponse = {
  idUsuario: number
  nome: string
  goleiro: boolean
  gols: number
  assistencias: number
}

export type MatchTeamDetailApiResponse = {
  numeroTime: number
  idCapitao: number
  nomeCapitao: string
  jogadores: MatchPlayerDetailApiResponse[]
}

export type MatchAwardDetailApiResponse = {
  tipo: string
  status: string
  rodada: number
  idVencedor: number | null
  nomeVencedor: string | null
}

export type MatchDetailApiResponse = {
  idPartida: number
  idGrupo: number
  dataHoraJogo: string
  status: MatchStatus
  observacao: string | null
  limiteVagas: number
  totalConfirmados: number
  totalAusentes: number
  golsTime1: number | null
  golsTime2: number | null
  numeroTimeVencedor: number | null
  nomeCapitaoVencedor: string | null
  time1: MatchTeamDetailApiResponse | null
  time2: MatchTeamDetailApiResponse | null
  confirmadosNomes: string[]
  ausentesNomes: string[]
  naoConfirmaramNomes: string[]
  premios: MatchAwardDetailApiResponse[]
}

export type MatchPresenceApiResponse = {
  idPartida: number
  status: MatchPresenceStatus
  totalConfirmados: number
  limiteVagas: number
}

export type MessageApiResponse = {
  mensagem: string
}

export type CreateMatchInput = {
  idGrupo: number
  dataHoraJogo: string
  limiteVagas: number
  observacao?: string | null
}

export type AddGuestToMatchInput = {
  nome: string
}

export type MatchConfirmedInfo = {
  nome: string
  goleiro: boolean
}

export type Match = {
  idPartida: number
  idGrupo: number
  idTemporada: number
  dataHoraJogo: string
  status: MatchStatus
  observacao: string | null
  totalConfirmados: number
  limiteVagas: number
  limiteCheio: boolean
  usuarioConfirmado: boolean
  usuarioAusente: boolean
  confirmados: MatchConfirmedInfo[]
  ausentesNomes: string[]
  naoConfirmaramNomes: string[]
  nomeCapitaoVencedor: string | null
  jogadoresVencedores: string[]
  criadoEm: string
}

export type MatchPlayerDetail = {
  idUsuario: number
  nome: string
  goleiro: boolean
  gols: number
  assistencias: number
}

export type MatchTeamDetail = {
  numeroTime: number
  idCapitao: number
  nomeCapitao: string
  jogadores: MatchPlayerDetail[]
}

export type MatchAwardDetail = {
  tipo: string
  status: string
  rodada: number
  idVencedor: number | null
  nomeVencedor: string | null
}

export type MatchDetail = {
  idPartida: number
  idGrupo: number
  dataHoraJogo: string
  status: MatchStatus
  observacao: string | null
  limiteVagas: number
  totalConfirmados: number
  totalAusentes: number
  golsTime1: number | null
  golsTime2: number | null
  numeroTimeVencedor: number | null
  nomeCapitaoVencedor: string | null
  time1: MatchTeamDetail | null
  time2: MatchTeamDetail | null
  confirmadosNomes: string[]
  ausentesNomes: string[]
  naoConfirmaramNomes: string[]
  premios: MatchAwardDetail[]
}

export type MatchPresenceResult = {
  idPartida: number
  status: MatchPresenceStatus
  totalConfirmados: number
  limiteVagas: number
}

export type MessageResult = {
  mensagem: string
}
