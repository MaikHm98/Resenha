import { Button } from '../../../shared/components'
import type {
  MatchVoteRound,
  MatchVoteType,
} from '../types/voteContracts'

type VoteCandidatesListProps = {
  round: MatchVoteRound
  type: MatchVoteType
  activeVoteType: MatchVoteType | null
  activeVoteCandidateUserId: number | null
  isCastingVote: boolean
  onVote: (
    type: MatchVoteType,
    candidateUserId: number,
    candidateName: string,
  ) => Promise<boolean>
}

const VOTE_TYPE_LABELS: Record<MatchVoteType, string> = {
  MVP: 'MVP',
  BOLA_MURCHA: 'BOLA MURCHA',
}

export function VoteCandidatesList({
  round,
  type,
  activeVoteType,
  activeVoteCandidateUserId,
  isCastingVote,
  onVote,
}: VoteCandidatesListProps) {
  if (round.candidatos.length === 0) {
    return (
      <div className="vote-candidates-list__empty">
        <h4>Nenhum candidato disponivel no snapshot</h4>
        <p>
          O backend ainda nao devolveu candidatos para a rodada atual de{' '}
          {VOTE_TYPE_LABELS[type]}.
        </p>
      </div>
    )
  }

  return (
    <ul className="vote-candidates-list">
      {round.candidatos.map((candidate) => {
        const isCurrentAction =
          isCastingVote &&
          activeVoteType === type &&
          activeVoteCandidateUserId === candidate.idUsuario

        return (
          <li className="vote-candidates-list__item" key={candidate.idUsuario}>
            <div className="vote-candidates-list__item-copy">
              <strong>{candidate.nome}</strong>
              <p className="vote-candidates-list__meta">
                {candidate.votos} voto{candidate.votos === 1 ? '' : 's'} nesta rodada
              </p>
            </div>

            <div className="vote-candidates-list__item-actions">
              <span className="vote-candidates-list__badge">#{candidate.idUsuario}</span>
              <Button
                loading={isCurrentAction}
                onClick={() => void onVote(type, candidate.idUsuario, candidate.nome)}
                size="sm"
                type="button"
                variant="primary"
              >
                Votar em {VOTE_TYPE_LABELS[type]}
              </Button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
