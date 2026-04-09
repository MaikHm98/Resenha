import { Alert, Button } from '../../../shared/components'
import type {
  MatchVoteRound,
  MatchVoteType,
} from '../types/voteContracts'

type ApproveVoteSectionProps = {
  canManageVoting: boolean
  mvpRound: MatchVoteRound | null
  bolaMurchaRound: MatchVoteRound | null
  approveVoteError: string | null
  approveVoteNotice: string | null
  activeApproveVoteType: MatchVoteType | null
  isApprovingVote: boolean
  onApproveVote: (type: MatchVoteType) => Promise<boolean>
  onClearFeedback: () => void
}

type ApproveVoteCardProps = {
  canManageVoting: boolean
  round: MatchVoteRound | null
  type: MatchVoteType
  activeApproveVoteType: MatchVoteType | null
  isApprovingVote: boolean
  onApproveVote: (type: MatchVoteType) => Promise<boolean>
}

const VOTE_TYPE_LABELS: Record<MatchVoteType, string> = {
  MVP: 'MVP',
  BOLA_MURCHA: 'BOLA MURCHA',
}

function ApproveVoteCard({
  canManageVoting,
  round,
  type,
  activeApproveVoteType,
  isApprovingVote,
  onApproveVote,
}: ApproveVoteCardProps) {
  if (round === null) {
    return (
      <article className="approve-vote-section__card">
        <header className="approve-vote-section__card-header">
          <div>
            <p className="approve-vote-section__label">{VOTE_TYPE_LABELS[type]}</p>
            <h3 className="approve-vote-section__title">Sem rodada atual</h3>
          </div>
          <span className="approve-vote-section__badge approve-vote-section__badge--outline">
            Indisponivel
          </span>
        </header>

        <div className="approve-vote-section__notice">
          <p>
            O backend ainda nao devolveu rodada atual para aprovacao em{' '}
            {VOTE_TYPE_LABELS[type]}.
          </p>
        </div>
      </article>
    )
  }

  const canApprove = canManageVoting && round.status === 'APURADA'
  const isApproved = round.status === 'APROVADA'
  const isCurrentAction = isApprovingVote && activeApproveVoteType === type

  return (
    <article className="approve-vote-section__card">
      <header className="approve-vote-section__card-header">
        <div>
          <p className="approve-vote-section__label">{VOTE_TYPE_LABELS[type]}</p>
          <h3 className="approve-vote-section__title">Rodada {round.rodada}</h3>
        </div>
        <span className="approve-vote-section__badge">{round.status}</span>
      </header>

      {!canManageVoting ? (
        <div className="approve-vote-section__notice">
          <p>A aprovacao final continua restrita ao admin.</p>
        </div>
      ) : null}

      {canManageVoting && isApproved ? (
        <div className="approve-vote-section__notice">
          <p>
            Esta votacao ja aparece como aprovada no snapshot atual. Nenhuma acao
            extra e antecipada pelo frontend.
          </p>
        </div>
      ) : null}

      {canManageVoting && !isApproved && !canApprove ? (
        <div className="approve-vote-section__notice">
          <p>
            A rodada ainda nao chegou ao ponto de aprovacao final no snapshot
            atual. O frontend continua aguardando o backend sinalizar esse estado.
          </p>
        </div>
      ) : null}

      <div className="approve-vote-section__copy">
        <p>
          A aprovacao final nao recalcula classificacao nem antecipa qualquer efeito
          colateral no cliente. A tela apenas envia a acao e recarrega o snapshot.
        </p>
      </div>

      {canApprove ? (
        <Button
          loading={isCurrentAction}
          onClick={() => void onApproveVote(type)}
          type="button"
        >
          Aprovar {VOTE_TYPE_LABELS[type]}
        </Button>
      ) : null}
    </article>
  )
}

export function ApproveVoteSection({
  canManageVoting,
  mvpRound,
  bolaMurchaRound,
  approveVoteError,
  approveVoteNotice,
  activeApproveVoteType,
  isApprovingVote,
  onApproveVote,
  onClearFeedback,
}: ApproveVoteSectionProps) {
  return (
    <div className="approve-vote-section">
      {approveVoteError ? (
        <div className="approve-vote-section__feedback">
          <Alert title="Nao foi possivel aprovar a votacao" variant="warning">
            {approveVoteError}
          </Alert>
          <div className="approve-vote-section__feedback-actions">
            <Button onClick={onClearFeedback} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      {approveVoteNotice ? (
        <div className="approve-vote-section__feedback">
          <Alert title="Votacao aprovada" variant="success">
            {approveVoteNotice}
          </Alert>
          <div className="approve-vote-section__feedback-actions">
            <Button onClick={onClearFeedback} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      <div className="approve-vote-section__grid">
        <ApproveVoteCard
          activeApproveVoteType={activeApproveVoteType}
          canManageVoting={canManageVoting}
          isApprovingVote={isApprovingVote}
          onApproveVote={onApproveVote}
          round={mvpRound}
          type="MVP"
        />
        <ApproveVoteCard
          activeApproveVoteType={activeApproveVoteType}
          canManageVoting={canManageVoting}
          isApprovingVote={isApprovingVote}
          onApproveVote={onApproveVote}
          round={bolaMurchaRound}
          type="BOLA_MURCHA"
        />
      </div>
    </div>
  )
}
