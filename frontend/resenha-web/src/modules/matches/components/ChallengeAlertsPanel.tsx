type ChallengeAlertsPanelProps = {
  alertas: string[]
  bloqueios: string[]
  isManualGoalkeeperState?: boolean
}

function ChallengeMessageGroup({
  title,
  messages,
  emptyMessage,
  variant,
}: {
  title: string
  messages: string[]
  emptyMessage: string
  variant: 'alertas' | 'bloqueios'
}) {
  return (
    <section
      className={[
        'challenge-alerts-panel__group',
        `challenge-alerts-panel__group--${variant}`,
      ].join(' ')}
    >
      <header className="challenge-alerts-panel__group-header">
        <h3 className="challenge-alerts-panel__group-title">{title}</h3>
        <span className="challenge-alerts-panel__group-count">{messages.length}</span>
      </header>

      {messages.length > 0 ? (
        <ul className="challenge-alerts-panel__list">
          {messages.map((message, index) => (
            <li
              className="challenge-alerts-panel__list-item"
              key={`${variant}-${index}`}
            >
              {message}
            </li>
          ))}
        </ul>
      ) : (
        <div className="challenge-alerts-panel__empty">
          <p>{emptyMessage}</p>
        </div>
      )}
    </section>
  )
}

export function ChallengeAlertsPanel({
  alertas,
  bloqueios,
  isManualGoalkeeperState = false,
}: ChallengeAlertsPanelProps) {
  return (
    <div className="challenge-alerts-panel">
      {isManualGoalkeeperState ? (
        <section className="challenge-alerts-panel__manual-state">
          <header className="challenge-alerts-panel__manual-state-header">
            <h3 className="challenge-alerts-panel__group-title">Estado manual</h3>
            <span className="challenge-alerts-panel__group-count">
              Somente leitura
            </span>
          </header>
          <p className="challenge-alerts-panel__manual-state-copy">
            O backend sinalizou `DEFINICAO_MANUAL_GOLEIRO`. O web permanece
            bloqueado para resolver esta etapa manualmente.
          </p>
        </section>
      ) : null}

      <ChallengeMessageGroup
        emptyMessage="Nenhum bloqueio informado neste snapshot."
        messages={bloqueios}
        title="Bloqueios"
        variant="bloqueios"
      />
      <ChallengeMessageGroup
        emptyMessage="Nenhum alerta informado neste snapshot."
        messages={alertas}
        title="Alertas"
        variant="alertas"
      />
    </div>
  )
}
