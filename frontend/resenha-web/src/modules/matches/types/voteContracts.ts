export const MATCH_VOTE_TYPE_VALUES = ['MVP', 'BOLA_MURCHA'] as const
export type MatchVoteType = (typeof MATCH_VOTE_TYPE_VALUES)[number]

export const MATCH_VOTE_ROUND_STATUS_VALUES = [
  'ABERTA',
  'ENCERRADA',
  'APURADA',
  'APROVADA',
] as const
export type MatchVoteRoundStatus =
  (typeof MATCH_VOTE_ROUND_STATUS_VALUES)[number]

export type MatchVoteCandidateApiResponse = {
  idUsuario: number
  nome: string
  votos: number
}

export type MatchVoteRoundApiResponse = {
  idVotacao: number
  tipo: MatchVoteType
  rodada: number
  status: MatchVoteRoundStatus
  candidatos: MatchVoteCandidateApiResponse[]
  idVencedorProvisorio: number | null
  nomeVencedorProvisorio: string | null
}

export type MatchVoteStatusApiResponse = {
  mvp: MatchVoteRoundApiResponse | null
  bolaMurcha: MatchVoteRoundApiResponse | null
  mvpHistorico: MatchVoteRoundApiResponse[]
  bolaMurchaHistorico: MatchVoteRoundApiResponse[]
}

export type CastMatchVoteInput = {
  tipo: MatchVoteType
  idUsuarioVotado: number
}

export type CloseMatchVoteInput = {
  tipo: MatchVoteType
}

export type ApproveMatchVoteInput = {
  tipo: MatchVoteType
}

export type MatchVoteCandidate = {
  idUsuario: number
  nome: string
  votos: number
}

export type MatchVoteRound = {
  idVotacao: number
  tipo: MatchVoteType
  rodada: number
  status: MatchVoteRoundStatus
  candidatos: MatchVoteCandidate[]
  idVencedorProvisorio: number | null
  nomeVencedorProvisorio: string | null
}

export type MatchVoteStatus = {
  mvp: MatchVoteRound | null
  bolaMurcha: MatchVoteRound | null
  mvpHistorico: MatchVoteRound[]
  bolaMurchaHistorico: MatchVoteRound[]
}
