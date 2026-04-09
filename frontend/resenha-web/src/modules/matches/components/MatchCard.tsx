import { Link } from 'react-router-dom'
import { buildMatchDetailPath } from '../../../app/router/paths'
import type { Match, MatchStatus } from '../types/matchesContracts'

type MatchCardProps = {
  match: Match
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

function getUserStateLabel(match: Match): string {
  if (match.usuarioConfirmado) {
    return 'Confirmado'
  }

  if (match.usuarioAusente) {
    return 'Ausente'
  }

  return 'Sem resposta'
}

function getUserStateClassName(match: Match): string {
  if (match.usuarioConfirmado) {
    return 'match-card__user-state--confirmed'
  }

  if (match.usuarioAusente) {
    return 'match-card__user-state--absent'
  }

  return 'match-card__user-state--neutral'
}

function getConfirmedPreview(match: Match): string {
  if (match.confirmados.length === 0) {
    return 'Nenhum confirmado ate agora.'
  }

  if (match.confirmados.length <= 3) {
    return match.confirmados.map((confirmed) => confirmed.nome).join(', ')
  }

  const firstNames = match.confirmados
    .slice(0, 3)
    .map((confirmed) => confirmed.nome)
    .join(', ')
  const remainingCount = match.confirmados.length - 3

  return `${firstNames} +${remainingCount}`
}

export function MatchCard({ match }: MatchCardProps) {
  const statusLabel = MATCH_STATUS_LABELS[match.status]

  return (
    <li className="match-card">
      <header className="match-card__header">
        <div>
          <p className="match-card__date">{formatDateTime(match.dataHoraJogo)}</p>
          <h3 className="match-card__title">Partida #{match.idPartida}</h3>
        </div>

        <span
          className={[
            'match-card__status',
            `match-card__status--${match.status.toLowerCase()}`,
          ].join(' ')}
        >
          {statusLabel}
        </span>
      </header>

      <p className="match-card__description">
        {match.observacao || 'Partida sem observacao cadastrada.'}
      </p>

      <dl className="match-card__details">
        <div>
          <dt>Confirmados</dt>
          <dd>
            {match.totalConfirmados}/{match.limiteVagas}
          </dd>
        </div>
        <div>
          <dt>Sua resposta</dt>
          <dd>
            <span
              className={[
                'match-card__user-state',
                getUserStateClassName(match),
              ].join(' ')}
            >
              {getUserStateLabel(match)}
            </span>
          </dd>
        </div>
        <div>
          <dt>Ausentes</dt>
          <dd>{match.ausentesNomes.length}</dd>
        </div>
        <div>
          <dt>Sem resposta</dt>
          <dd>{match.naoConfirmaramNomes.length}</dd>
        </div>
      </dl>

      <div className="match-card__summary">
        <p>
          <strong>Lista atual:</strong> {getConfirmedPreview(match)}
        </p>
        {match.limiteCheio ? (
          <span className="match-card__flag">Lista cheia</span>
        ) : null}
        {match.nomeCapitaoVencedor ? (
          <p>
            <strong>Capitao vencedor:</strong> {match.nomeCapitaoVencedor}
          </p>
        ) : null}
      </div>

      <div className="match-card__actions">
        <Link className="match-card__link" to={buildMatchDetailPath(match.idPartida)}>
          Abrir detalhe
        </Link>
      </div>
    </li>
  )
}
