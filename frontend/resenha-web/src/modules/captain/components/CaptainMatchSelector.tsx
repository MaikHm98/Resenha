import type { ChangeEvent } from 'react'
import type { Match } from '../../matches/types/matchesContracts'

type CaptainMatchSelectorProps = {
  matches: Match[]
  selectedMatchId: number | null
  onSelectMatch: (matchId: number | null) => void
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function CaptainMatchSelector({
  matches,
  selectedMatchId,
  onSelectMatch,
}: CaptainMatchSelectorProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value
    if (nextValue === '') {
      onSelectMatch(null)
      return
    }

    const parsedValue = Number.parseInt(nextValue, 10)
    onSelectMatch(Number.isNaN(parsedValue) ? null : parsedValue)
  }

  return (
    <div className="captain-match-selector">
      <label
        className="captain-match-selector__label"
        htmlFor="captain-match-selector-input"
      >
        Partida usada como contexto do desafio
      </label>

      <select
        className="captain-match-selector__input"
        id="captain-match-selector-input"
        onChange={handleChange}
        value={selectedMatchId ?? ''}
      >
        <option value="">Selecione uma partida do grupo</option>
        {matches.map((match) => (
          <option key={match.idPartida} value={match.idPartida}>
            {formatDateTime(match.dataHoraJogo)} - {match.status} -{' '}
            {match.totalConfirmados} confirmados
          </option>
        ))}
      </select>

      <p className="captain-match-selector__hint">
        A lista de partidas vem de `GET /api/groups/{'{'}groupId{'}'}/matches`
        apenas como contexto de selecao.
      </p>
    </div>
  )
}
