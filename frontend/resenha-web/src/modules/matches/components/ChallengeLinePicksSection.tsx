import { Alert, Button } from '../../../shared/components'
import { ChallengeAvailablePlayersPanel } from './ChallengeAvailablePlayersPanel'
import type {
  MatchChallengePlayer,
  MatchChallengeStatus,
} from '../types/challengeContracts'

type ChallengeLinePicksSectionProps = {
  challenge: MatchChallengeStatus
  linePickError: string | null
  linePickNotice: string | null
  activeLinePickPlayerId: number | null
  isPickingLinePlayer: boolean
  onPickLinePlayer: (player: MatchChallengePlayer) => Promise<boolean>
  onClearFeedback: () => void
}

export function ChallengeLinePicksSection({
  challenge,
  linePickError,
  linePickNotice,
  activeLinePickPlayerId,
  isPickingLinePlayer,
  onPickLinePlayer,
  onClearFeedback,
}: ChallengeLinePicksSectionProps) {
  return (
    <div className="challenge-line-picks-section">
      <header className="challenge-line-picks-section__header">
        <div>
          <h3 className="challenge-line-picks-section__title">
            Picks de jogadores de linha
          </h3>
          <p className="challenge-line-picks-section__description">
            Os picks aparecem somente quando o snapshot libera a escolha de
            jogador de linha para o usuario atual.
          </p>
        </div>
      </header>

      {linePickNotice || linePickError ? (
        <div className="challenge-line-picks-section__feedback">
          {linePickNotice ? (
            <Alert title="Pick registrado" variant="success">
              {linePickNotice}
            </Alert>
          ) : null}
          {linePickError ? (
            <Alert title="Nao foi possivel registrar o pick" variant="error">
              {linePickError}
            </Alert>
          ) : null}
          <div className="challenge-line-picks-section__feedback-actions">
            <Button onClick={onClearFeedback} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      <ChallengeAvailablePlayersPanel
        actionLabel="Escolher"
        actionLoadingPlayerId={activeLinePickPlayerId}
        actionsEnabled={challenge.usuarioPodeEscolherJogadorLinha}
        emptyMessage="Nenhum jogador de linha disponivel neste snapshot."
        onAction={onPickLinePlayer}
        players={challenge.jogadoresLinhaDisponiveis}
        subtitle={
          challenge.usuarioPodeEscolherJogadorLinha
            ? 'O backend continua decidindo turno, elegibilidade e disponibilidade. O frontend apenas reflete o snapshot atual.'
            : 'O snapshot atual nao permite pick de jogador de linha para este usuario neste momento.'
        }
        title="Jogadores de linha disponiveis"
        variant="linha"
      />

      {!challenge.usuarioPodeEscolherJogadorLinha ? (
        <div className="challenge-line-picks-section__notice">
          <p>
            Os picks de linha continuam bloqueados para este usuario neste
            momento, de acordo com o snapshot atual.
          </p>
        </div>
      ) : null}

      {isPickingLinePlayer && activeLinePickPlayerId === null ? (
        <div className="challenge-line-picks-section__notice">
          <p>Registrando pick de linha...</p>
        </div>
      ) : null}
    </div>
  )
}
