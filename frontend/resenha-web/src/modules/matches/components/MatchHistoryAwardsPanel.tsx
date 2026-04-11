import type { MatchAwardDetail } from '../types/matchesContracts'

type MatchHistoryAwardsPanelProps = {
  awards: MatchAwardDetail[]
}

function formatAwardType(value: string): string {
  return value.replaceAll('_', ' ')
}

export function MatchHistoryAwardsPanel({
  awards,
}: MatchHistoryAwardsPanelProps) {
  if (awards.length === 0) {
    return (
      <div className="match-history-awards-panel__empty">
        <h3>Nenhuma premiacao registrada</h3>
        <p>O backend ainda nao devolveu premiacoes para esta partida.</p>
      </div>
    )
  }

  return (
    <div className="match-history-awards-panel">
      <ul className="match-history-awards-panel__list">
        {awards.map((award) => (
          <li
            className="match-history-awards-panel__item"
            key={`${award.tipo}-${award.rodada}-${award.status}`}
          >
            <header className="match-history-awards-panel__item-header">
              <div>
                <p className="match-history-awards-panel__label">
                  {formatAwardType(award.tipo)}
                </p>
                <h3 className="match-history-awards-panel__winner">
                  {award.nomeVencedor ?? 'Vencedor ainda nao definido'}
                </h3>
              </div>
              <span className="match-history-awards-panel__badge">
                {award.status}
              </span>
            </header>

            <p className="match-history-awards-panel__meta">
              Rodada {award.rodada}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
