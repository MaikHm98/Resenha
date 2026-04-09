import { Link } from 'react-router-dom'
import { buildGroupDetailPath } from '../../../app/router/paths'
import type { Group, GroupWeekday } from '../types/groupsContracts'

type GroupCardProps = {
  group: Group
}

const WEEKDAY_LABELS: Record<GroupWeekday, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terca-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sabado',
}

function formatDate(value: string): string {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsedDate)
}

function getWeekdayLabel(dayOfWeek: GroupWeekday | null): string {
  if (dayOfWeek === null) {
    return 'Nao definido'
  }

  return WEEKDAY_LABELS[dayOfWeek]
}

function getScheduleLabel(
  dayOfWeek: GroupWeekday | null,
  fixedTime: string | null,
): string {
  const weekdayLabel = getWeekdayLabel(dayOfWeek)
  const fixedTimeLabel = fixedTime ?? 'Horario nao definido'
  return `${weekdayLabel} - ${fixedTimeLabel}`
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <li className="group-card">
      <header className="group-card__header">
        <div>
          <h3 className="group-card__title">{group.nome}</h3>
          <p className="group-card__meta">
            {group.totalMembros}/{group.limiteJogadores} membros
          </p>
        </div>

        <span
          className={[
            'group-card__role',
            group.perfil === 'ADMIN'
              ? 'group-card__role--admin'
              : 'group-card__role--player',
          ].join(' ')}
        >
          {group.perfil}
        </span>
      </header>

      <p className="group-card__description">
        {group.descricao || 'Grupo sem descricao cadastrada.'}
      </p>

      <dl className="group-card__details">
        <div>
          <dt>Agenda</dt>
          <dd>{getScheduleLabel(group.diaSemana, group.horarioFixo)}</dd>
        </div>
        <div>
          <dt>Criado em</dt>
          <dd>{formatDate(group.criadoEm)}</dd>
        </div>
        <div>
          <dt>ID do grupo</dt>
          <dd>{group.idGrupo}</dd>
        </div>
      </dl>

      <div className="group-card__actions">
        <Link className="group-card__link" to={buildGroupDetailPath(group.idGrupo)}>
          Abrir detalhe
        </Link>
      </div>
    </li>
  )
}
