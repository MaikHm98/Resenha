import type { Group, GroupWeekday } from '../types/groupsContracts'

type GroupOverviewPanelProps = {
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

export function GroupOverviewPanel({ group }: GroupOverviewPanelProps) {
  return (
    <div className="group-overview-panel">
      <header className="group-overview-panel__header">
        <div>
          <h3 className="group-overview-panel__title">{group.nome}</h3>
          <p className="group-overview-panel__description">
            {group.descricao || 'Grupo sem descricao cadastrada.'}
          </p>
        </div>

        <span
          className={[
            'group-overview-panel__role',
            group.perfil === 'ADMIN'
              ? 'group-overview-panel__role--admin'
              : 'group-overview-panel__role--player',
          ].join(' ')}
        >
          {group.perfil}
        </span>
      </header>

      <dl className="group-overview-panel__details">
        <div>
          <dt>ID do grupo</dt>
          <dd>{group.idGrupo}</dd>
        </div>
        <div>
          <dt>Membros</dt>
          <dd>
            {group.totalMembros}/{group.limiteJogadores}
          </dd>
        </div>
        <div>
          <dt>Seu papel</dt>
          <dd>{group.perfil}</dd>
        </div>
        <div>
          <dt>Agenda</dt>
          <dd>{getScheduleLabel(group.diaSemana, group.horarioFixo)}</dd>
        </div>
        <div>
          <dt>Criado em</dt>
          <dd>{formatDate(group.criadoEm)}</dd>
        </div>
      </dl>
    </div>
  )
}
