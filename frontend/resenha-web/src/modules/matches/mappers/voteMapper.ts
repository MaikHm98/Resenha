import type {
  MatchVoteCandidate,
  MatchVoteCandidateApiResponse,
  MatchVoteRound,
  MatchVoteRoundApiResponse,
  MatchVoteStatus,
  MatchVoteStatusApiResponse,
} from '../types/voteContracts'

export function mapMatchVoteCandidateApiToMatchVoteCandidate(
  payload: MatchVoteCandidateApiResponse,
): MatchVoteCandidate {
  return {
    idUsuario: payload.idUsuario,
    nome: payload.nome,
    votos: payload.votos,
  }
}

export function mapMatchVoteRoundApiToMatchVoteRound(
  payload: MatchVoteRoundApiResponse,
): MatchVoteRound {
  return {
    idVotacao: payload.idVotacao,
    tipo: payload.tipo,
    rodada: payload.rodada,
    status: payload.status,
    candidatos: payload.candidatos.map(
      mapMatchVoteCandidateApiToMatchVoteCandidate,
    ),
    idVencedorProvisorio: payload.idVencedorProvisorio,
    nomeVencedorProvisorio: payload.nomeVencedorProvisorio,
  }
}

export function mapMatchVoteStatusApiToMatchVoteStatus(
  payload: MatchVoteStatusApiResponse,
): MatchVoteStatus {
  return {
    mvp: payload.mvp ? mapMatchVoteRoundApiToMatchVoteRound(payload.mvp) : null,
    bolaMurcha: payload.bolaMurcha
      ? mapMatchVoteRoundApiToMatchVoteRound(payload.bolaMurcha)
      : null,
    mvpHistorico: payload.mvpHistorico.map(mapMatchVoteRoundApiToMatchVoteRound),
    bolaMurchaHistorico: payload.bolaMurchaHistorico.map(
      mapMatchVoteRoundApiToMatchVoteRound,
    ),
  }
}
