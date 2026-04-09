import { Alert, Button } from '../../../shared/components'
import { VoteCandidatesList } from './VoteCandidatesList'
import type {
  MatchVoteRound,
  MatchVoteType,
} from '../types/voteContracts'

type CastVoteSectionProps = {
  mvpRound: MatchVoteRound | null
  bolaMurchaRound: MatchVoteRound | null
  voteError: string | null
  voteNotice: string | null
  activeVoteType: MatchVoteType | null
  activeVoteCandidateUserId: number | null
  isCastingVote: boolean
  onVote: (
    type: MatchVoteType,
    candidateUserId: number,
    candidateName: string,
  ) => Promise<boolean>
  onClearFeedback: () => void
}

type VoteCardProps = {
  round: MatchVoteRound | null
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

function VoteCard({
  round,
  type,
  activeVoteType,
  activeVoteCandidateUserId,
  isCastingVote,
  onVote,
}: VoteCardProps) {
  if (round === null) {
    return (
      <article className="cast-vote-section__card">
        <header className="cast-vote-section__card-header">
          <div>
            <p className="cast-vote-section__label">{VOTE_TYPE_LABELS[type]}</p>
            <h3 className="cast-vote-section__title">Rodada indisponivel</h3>
          </div>
          <span className="cast-vote-section__badge cast-vote-section__badge--outline">
            Sem rodada
          </span>
        </header>

        <div className="cast-vote-section__notice">
          <p>
            O backend ainda nao devolveu rodada ativa para {VOTE_TYPE_LABELS[type]}.
          </p>
        </div>
      </article>
    )
  }

  const canCastVote = round.status === 'ABERTA'

  return (
    <article className="cast-vote-section__card">
      <header className="cast-vote-section__card-header">
        <div>
          <p className="cast-vote-section__label">{VOTE_TYPE_LABELS[type]}</p>
          <h3 className="cast-vote-section__title">Rodada {round.rodada}</h3>
        </div>
        <span className="cast-vote-section__badge">{round.status}</span>
      </header>

      {!canCastVote ? (
        <div className="cast-vote-section__notice">
          <p>
            Esta rodada nao esta aberta para voto neste momento. O frontend continua
            refletindo somente o status devolvido pelo backend.
          </p>
        </div>
      ) : null}

      <div className="cast-vote-section__copy">
        <p>
          A lista abaixo replica apenas os candidatos que vieram no snapshot atual.
          Elegibilidade, auto-voto e voto duplicado continuam sendo validados pelo
          backend.
        </p>
      </div>

      {canCastVote ? (
        <VoteCandidatesList
          activeVoteCandidateUserId={activeVoteCandidateUserId}
          activeVoteType={activeVoteType}
          isCastingVote={isCastingVote}
          onVote={onVote}
          round={round}
          type={type}
        />
      ) : null}
    </article>
  )
}

export function CastVoteSection({
  mvpRound,
  bolaMurchaRound,
  voteError,
  voteNotice,
  activeVoteType,
  activeVoteCandidateUserId,
  isCastingVote,
  onVote,
  onClearFeedback,
}: CastVoteSectionProps) {
  return (
    <div className="cast-vote-section">
      {voteError ? (
        <div className="cast-vote-section__feedback">
          <Alert title="Nao foi possivel registrar o voto" variant="warning">
            {voteError}
          </Alert>
          <div className="cast-vote-section__feedback-actions">
            <Button onClick={onClearFeedback} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      {voteNotice ? (
        <div className="cast-vote-section__feedback">
          <Alert title="Voto registrado" variant="success">
            {voteNotice}
          </Alert>
          <div className="cast-vote-section__feedback-actions">
            <Button onClick={onClearFeedback} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      <div className="cast-vote-section__grid">
        <VoteCard
          activeVoteCandidateUserId={activeVoteCandidateUserId}
          activeVoteType={activeVoteType}
          isCastingVote={isCastingVote}
          onVote={onVote}
          round={mvpRound}
          type="MVP"
        />
        <VoteCard
          activeVoteCandidateUserId={activeVoteCandidateUserId}
          activeVoteType={activeVoteType}
          isCastingVote={isCastingVote}
          onVote={onVote}
          round={bolaMurchaRound}
          type="BOLA_MURCHA"
        />
      </div>
    </div>
  )
}
