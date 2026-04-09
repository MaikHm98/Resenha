import { Alert, Button } from '../../../shared/components'
import type {
  MatchVoteRound,
  MatchVoteType,
} from '../types/voteContracts'

type CloseVoteSectionProps = {
  canManageVoting: boolean
  mvpRound: MatchVoteRound | null
  bolaMurchaRound: MatchVoteRound | null
  closeVoteError: string | null
  closeVoteNotice: string | null
  activeCloseVoteType: MatchVoteType | null
  isClosingVote: boolean
  onCloseVote: (type: MatchVoteType) => Promise<boolean>
  onClearFeedback: () => void
}

type CloseVoteCardProps = {
  canManageVoting: boolean
  round: MatchVoteRound | null
  type: MatchVoteType
  activeCloseVoteType: MatchVoteType | null
  isClosingVote: boolean
  onCloseVote: (type: MatchVoteType) => Promise<boolean>
}

const VOTE_TYPE_LABELS: Record<MatchVoteType, string> = {
  MVP: 'MVP',
  BOLA_MURCHA: 'BOLA MURCHA',
}

function CloseVoteCard({
  canManageVoting,
  round,
  type,
  activeCloseVoteType,
  isClosingVote,
  onCloseVote,
}: CloseVoteCardProps) {
  if (round === null) {
    return (
      <article className="close-vote-section__card">
        <header className="close-vote-section__card-header">
          <div>
            <p className="close-vote-section__label">{VOTE_TYPE_LABELS[type]}</p>
            <h3 className="close-vote-section__title">Sem rodada atual</h3>
          </div>
          <span className="close-vote-section__badge close-vote-section__badge--outline">
            Indisponivel
          </span>
        </header>

        <div className="close-vote-section__notice">
          <p>
            O backend ainda nao devolveu rodada ativa para {VOTE_TYPE_LABELS[type]}.
          </p>
        </div>
      </article>
    )
  }

  const canCloseRound = canManageVoting && round.status === 'ABERTA'
  const isCurrentAction = isClosingVote && activeCloseVoteType === type

  return (
    <article className="close-vote-section__card">
      <header className="close-vote-section__card-header">
        <div>
          <p className="close-vote-section__label">{VOTE_TYPE_LABELS[type]}</p>
          <h3 className="close-vote-section__title">Rodada {round.rodada}</h3>
        </div>
        <span className="close-vote-section__badge">{round.status}</span>
      </header>

      {!canManageVoting ? (
        <div className="close-vote-section__notice">
          <p>O encerramento/apuracao desta rodada fica restrito ao admin.</p>
        </div>
      ) : null}

      {canManageVoting && round.status !== 'ABERTA' ? (
        <div className="close-vote-section__notice">
          <p>
            Esta rodada nao esta aberta para encerramento neste momento. A UI
            continua refletindo apenas o status devolvido pelo backend.
          </p>
        </div>
      ) : null}

      <div className="close-vote-section__copy">
        <p>
          Ao encerrar esta rodada, o backend decide apuracao, empate e eventual
          abertura de nova rodada, sem reconstrucao local no frontend.
        </p>
      </div>

      {canCloseRound ? (
        <Button
          loading={isCurrentAction}
          onClick={() => void onCloseVote(type)}
          type="button"
        >
          Encerrar/apurar {VOTE_TYPE_LABELS[type]}
        </Button>
      ) : null}
    </article>
  )
}

export function CloseVoteSection({
  canManageVoting,
  mvpRound,
  bolaMurchaRound,
  closeVoteError,
  closeVoteNotice,
  activeCloseVoteType,
  isClosingVote,
  onCloseVote,
  onClearFeedback,
}: CloseVoteSectionProps) {
  return (
    <div className="close-vote-section">
      {closeVoteError ? (
        <div className="close-vote-section__feedback">
          <Alert title="Nao foi possivel encerrar a rodada" variant="warning">
            {closeVoteError}
          </Alert>
          <div className="close-vote-section__feedback-actions">
            <Button onClick={onClearFeedback} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      {closeVoteNotice ? (
        <div className="close-vote-section__feedback">
          <Alert title="Rodada atualizada" variant="success">
            {closeVoteNotice}
          </Alert>
          <div className="close-vote-section__feedback-actions">
            <Button onClick={onClearFeedback} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      <div className="close-vote-section__grid">
        <CloseVoteCard
          activeCloseVoteType={activeCloseVoteType}
          canManageVoting={canManageVoting}
          isClosingVote={isClosingVote}
          onCloseVote={onCloseVote}
          round={mvpRound}
          type="MVP"
        />
        <CloseVoteCard
          activeCloseVoteType={activeCloseVoteType}
          canManageVoting={canManageVoting}
          isClosingVote={isClosingVote}
          onCloseVote={onCloseVote}
          round={bolaMurchaRound}
          type="BOLA_MURCHA"
        />
      </div>
    </div>
  )
}
