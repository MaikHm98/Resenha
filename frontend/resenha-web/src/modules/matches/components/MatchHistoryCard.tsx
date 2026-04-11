import { Link } from 'react-router-dom'
import { buildMatchHistoryPath } from '../../../app/router/paths'
import type { MatchHistorySummary, MatchStatus } from '../types/matchesContracts'

type MatchHistoryCardProps = {
  match: MatchHistorySummary
  groupId: number | null
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
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsedDate)
}

function getWinnerSummary(match: MatchHistorySummary): string {
  if (match.nomeCapitaoVencedor) {
    return `Vitoria do time de ${match.nomeCapitaoVencedor}`
  }

  if (match.numeroTimeVencedor !== null) {
    return `Vitoria do time ${match.numeroTimeVencedor}`
  }

  return 'Sem vencedor registrado'
}

export function MatchHistoryCard({ match, groupId }: MatchHistoryCardProps) {
  const statusLabel = MATCH_STATUS_LABELS[match.status]

  return (
    <li className="match-history-card">
      <header className="match-history-card__header">
        <div>
          <p className="match-history-card__date">
            {formatDateTime(match.dataHoraJogo)}
          </p>
          <h3 className="match-history-card__title">Partida #{match.idPartida}</h3>
        </div>

        <span
          className={[
            'match-history-card__status',
            `match-history-card__status--${match.status.toLowerCase()}`,
          ].join(' ')}
        >
          {statusLabel}
        </span>
      </header>

      <section className="match-history-card__scoreboard" aria-label="Placar e capitaes">
        <article className="match-history-card__team">
          <p className="match-history-card__team-label">Time 1</p>
          <strong className="match-history-card__team-name">
            {match.nomeCapitaoTime1 ?? 'Sem capitao definido'}
          </strong>
        </article>

        <article className="match-history-card__score-box">
          <p className="match-history-card__score">
            {match.golsTime1 ?? '-'} x {match.golsTime2 ?? '-'}
          </p>
          <p className="match-history-card__score-meta">
            {match.numeroTimeVencedor !== null
              ? `Time vencedor: ${match.numeroTimeVencedor}`
              : 'Sem vencedor definido'}
          </p>
        </article>

        <article className="match-history-card__team match-history-card__team--align-end">
          <p className="match-history-card__team-label">Time 2</p>
          <strong className="match-history-card__team-name">
            {match.nomeCapitaoTime2 ?? 'Sem capitao definido'}
          </strong>
        </article>
      </section>

      <dl className="match-history-card__details">
        <div>
          <dt>Ocupacao</dt>
          <dd>
            {match.totalConfirmados}/{match.limiteVagas}
          </dd>
        </div>
        <div>
          <dt>Vencedor</dt>
          <dd>{getWinnerSummary(match)}</dd>
        </div>
      </dl>

      <div className="match-history-card__actions">
        <Link
          className="match-history-card__link"
          state={groupId !== null ? { groupId } : undefined}
          to={buildMatchHistoryPath(match.idPartida)}
        >
          Abrir detalhe historico
        </Link>
      </div>
    </li>
  )
}
