import type { MatchDetail } from '../types/matchesContracts'

type MatchAttendancePanelProps = {
  match: MatchDetail
}

type AttendanceGroup = {
  key: 'confirmados' | 'ausentes' | 'pendentes'
  title: string
  names: string[]
  emptyMessage: string
}

function MatchAttendanceGroup({ group }: { group: AttendanceGroup }) {
  return (
    <section
      className={[
        'match-attendance-panel__group',
        `match-attendance-panel__group--${group.key}`,
      ].join(' ')}
    >
      <header className="match-attendance-panel__group-header">
        <h3 className="match-attendance-panel__group-title">{group.title}</h3>
        <span className="match-attendance-panel__group-count">
          {group.names.length}
        </span>
      </header>

      {group.names.length > 0 ? (
        <ul className="match-attendance-panel__list">
          {group.names.map((name, index) => (
            <li
              className="match-attendance-panel__list-item"
              key={`${group.key}-${name}-${index}`}
            >
              {name}
            </li>
          ))}
        </ul>
      ) : (
        <div className="match-attendance-panel__empty">
          <p>{group.emptyMessage}</p>
        </div>
      )}
    </section>
  )
}

export function MatchAttendancePanel({ match }: MatchAttendancePanelProps) {
  const attendanceGroups: AttendanceGroup[] = [
    {
      key: 'confirmados',
      title: 'Confirmados',
      names: match.confirmadosNomes,
      emptyMessage: 'Nenhum confirmado registrado ate agora.',
    },
    {
      key: 'ausentes',
      title: 'Ausentes',
      names: match.ausentesNomes,
      emptyMessage: 'Nenhum ausente registrado nesta partida.',
    },
    {
      key: 'pendentes',
      title: 'Sem resposta',
      names: match.naoConfirmaramNomes,
      emptyMessage: 'Todos os membros ja responderam.',
    },
  ]

  return (
    <div className="match-attendance-panel">
      <div className="match-attendance-panel__summary">
        <div className="match-attendance-panel__summary-card">
          <span>Confirmados</span>
          <strong>{match.totalConfirmados}</strong>
        </div>
        <div className="match-attendance-panel__summary-card">
          <span>Ausentes</span>
          <strong>{match.ausentesNomes.length}</strong>
        </div>
        <div className="match-attendance-panel__summary-card">
          <span>Sem resposta</span>
          <strong>{match.naoConfirmaramNomes.length}</strong>
        </div>
      </div>

      <div className="match-attendance-panel__groups">
        {attendanceGroups.map((group) => (
          <MatchAttendanceGroup group={group} key={group.key} />
        ))}
      </div>
    </div>
  )
}
