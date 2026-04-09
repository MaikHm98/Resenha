import type { MatchDetail, MatchStatus } from '../types/matchesContracts'

type MatchOverviewPanelProps = {
  match: MatchDetail
}

const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  ABERTA: 'ABERTA',
  EM_ANDAMENTO: 'EM ANDAMENTO',
  FINALIZADA: 'FINALIZADA',
  CANCELADA: 'CANCELADA',
}

function formatDateTime(value: string): string {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsedDate)
}

export function MatchOverviewPanel({ match }: MatchOverviewPanelProps) {
  const statusLabel = MATCH_STATUS_LABELS[match.status]

  return (
    <div className="match-overview-panel">
      <header className="match-overview-panel__header">
        <div>
          <h3 className="match-overview-panel__title">Partida #{match.idPartida}</h3>
          <p className="match-overview-panel__description">
            {match.observacao || 'Partida sem observacao cadastrada.'}
          </p>
        </div>

        <span
          className={[
            'match-overview-panel__status',
            `match-overview-panel__status--${match.status.toLowerCase()}`,
          ].join(' ')}
        >
          {statusLabel}
        </span>
      </header>

      <dl className="match-overview-panel__details">
        <div>
          <dt>Data e hora</dt>
          <dd>{formatDateTime(match.dataHoraJogo)}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{statusLabel}</dd>
        </div>
        <div>
          <dt>Limite de vagas</dt>
          <dd>{match.limiteVagas}</dd>
        </div>
        <div>
          <dt>Total de confirmados</dt>
          <dd>{match.totalConfirmados}</dd>
        </div>
      </dl>
    </div>
  )
}
