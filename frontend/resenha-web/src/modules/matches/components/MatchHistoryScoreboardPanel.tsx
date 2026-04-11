import type { MatchDetail, MatchStatus } from '../types/matchesContracts'

type MatchHistoryScoreboardPanelProps = {
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

function getWinnerSummary(match: MatchDetail): string {
  if (match.nomeCapitaoVencedor) {
    return `Vitoria do time de ${match.nomeCapitaoVencedor}`
  }

  if (match.numeroTimeVencedor !== null) {
    return `Time vencedor: ${match.numeroTimeVencedor}`
  }

  return 'Sem vencedor registrado'
}

export function MatchHistoryScoreboardPanel({
  match,
}: MatchHistoryScoreboardPanelProps) {
  const statusLabel = MATCH_STATUS_LABELS[match.status]

  return (
    <div className="match-history-scoreboard-panel">
      <div className="match-history-scoreboard-panel__hero">
        <div>
          <p className="match-history-scoreboard-panel__eyebrow">
            Partida #{match.idPartida}
          </p>
          <h3 className="match-history-scoreboard-panel__title">
            {match.golsTime1 ?? '-'} x {match.golsTime2 ?? '-'}
          </h3>
          <p className="match-history-scoreboard-panel__subtitle">
            {getWinnerSummary(match)}
          </p>
        </div>

        <span
          className={[
            'match-history-scoreboard-panel__status',
            `match-history-scoreboard-panel__status--${match.status.toLowerCase()}`,
          ].join(' ')}
        >
          {statusLabel}
        </span>
      </div>

      <dl className="match-history-scoreboard-panel__meta">
        <div className="match-history-scoreboard-panel__meta-item">
          <dt>Data e hora</dt>
          <dd>{formatDateTime(match.dataHoraJogo)}</dd>
        </div>
        <div className="match-history-scoreboard-panel__meta-item">
          <dt>Status</dt>
          <dd>{statusLabel}</dd>
        </div>
        <div className="match-history-scoreboard-panel__meta-item">
          <dt>Confirmados</dt>
          <dd>{match.totalConfirmados}</dd>
        </div>
        <div className="match-history-scoreboard-panel__meta-item">
          <dt>Ausentes</dt>
          <dd>{match.totalAusentes}</dd>
        </div>
        <div className="match-history-scoreboard-panel__meta-item">
          <dt>Limite de vagas</dt>
          <dd>{match.limiteVagas}</dd>
        </div>
        <div className="match-history-scoreboard-panel__meta-item">
          <dt>Vencedor</dt>
          <dd>{getWinnerSummary(match)}</dd>
        </div>
      </dl>

      <div className="match-history-scoreboard-panel__notes">
        <article className="match-history-scoreboard-panel__note">
          <h4>Placar</h4>
          <p>
            {match.golsTime1 !== null || match.golsTime2 !== null
              ? `${match.golsTime1 ?? '-'} x ${match.golsTime2 ?? '-'}`
              : 'Placar ainda nao registrado.'}
          </p>
        </article>

        <article className="match-history-scoreboard-panel__note">
          <h4>Observacao</h4>
          <p>{match.observacao ?? 'Partida sem observacao cadastrada.'}</p>
        </article>
      </div>
    </div>
  )
}
