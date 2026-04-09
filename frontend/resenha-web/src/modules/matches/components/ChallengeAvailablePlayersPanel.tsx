import { Button } from '../../../shared/components'
import type { MatchChallengePlayer } from '../types/challengeContracts'

type ChallengeAvailablePlayersPanelProps = {
  title: string
  subtitle: string
  players: MatchChallengePlayer[]
  emptyMessage: string
  variant: 'linha' | 'goleiros'
  actionLabel?: string
  actionLoadingPlayerId?: number | null
  actionsEnabled?: boolean
  onAction?: (player: MatchChallengePlayer) => Promise<boolean> | void
}

export function ChallengeAvailablePlayersPanel({
  title,
  subtitle,
  players,
  emptyMessage,
  variant,
  actionLabel,
  actionLoadingPlayerId = null,
  actionsEnabled = false,
  onAction,
}: ChallengeAvailablePlayersPanelProps) {
  const showActions = actionsEnabled && Boolean(onAction) && Boolean(actionLabel)

  return (
    <div className="challenge-available-players-panel">
      <header className="challenge-available-players-panel__header">
        <div>
          <h3 className="challenge-available-players-panel__title">{title}</h3>
          <p className="challenge-available-players-panel__description">
            {subtitle}
          </p>
        </div>
        <span className="challenge-available-players-panel__count">
          {players.length}
        </span>
      </header>

      {players.length > 0 ? (
        <ul className="challenge-available-players-panel__list">
          {players.map((player) => (
            <li
              className={[
                'challenge-available-players-panel__item',
                `challenge-available-players-panel__item--${variant}`,
              ].join(' ')}
              key={`${variant}-${player.idUsuario}`}
            >
              <span>{player.nome}</span>
              <div className="challenge-available-players-panel__item-actions">
                {player.goleiro ? (
                  <span className="challenge-available-players-panel__badge">
                    Goleiro
                  </span>
                ) : null}
                {showActions ? (
                  <Button
                    loading={actionLoadingPlayerId === player.idUsuario}
                    onClick={() => void onAction?.(player)}
                    size="sm"
                    type="button"
                  >
                    {actionLabel}
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="challenge-available-players-panel__empty">
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  )
}
