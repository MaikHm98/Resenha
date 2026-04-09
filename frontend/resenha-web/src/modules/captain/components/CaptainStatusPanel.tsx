import type { CaptainStatus } from '../types/captainContracts'

type CaptainStatusPanelProps = {
  captainStatus: CaptainStatus
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('pt-BR')
}

export function CaptainStatusPanel({
  captainStatus,
}: CaptainStatusPanelProps) {
  const hasChallenger =
    captainStatus.idDesafiante !== null && captainStatus.nomeDesafiante !== null

  return (
    <div className="captain-status-panel">
      <div className="captain-status-panel__highlight-grid">
        <article className="captain-status-panel__card">
          <p className="captain-status-panel__label">Capitao atual</p>
          <strong className="captain-status-panel__name">
            {captainStatus.nomeCapitao}
          </strong>
          <p className="captain-status-panel__meta">
            Ciclo iniciado em {formatDate(captainStatus.iniciadoEm)}.
          </p>
        </article>

        <article className="captain-status-panel__card">
          <p className="captain-status-panel__label">Desafiante atual</p>
          <strong className="captain-status-panel__name">
            {hasChallenger
              ? captainStatus.nomeDesafiante
              : 'Nenhum desafiante definido'}
          </strong>
          <p className="captain-status-panel__meta">
            {hasChallenger
              ? 'Ha um desafio pendente para este ciclo.'
              : 'O ciclo segue sem desafio pendente neste momento.'}
          </p>
        </article>
      </div>

      <dl className="captain-status-panel__stats">
        <div className="captain-status-panel__stat">
          <dt>Status do ciclo</dt>
          <dd>{captainStatus.status}</dd>
        </div>
        <div className="captain-status-panel__stat">
          <dt>Bloqueados no ciclo</dt>
          <dd>{captainStatus.bloqueados.length}</dd>
        </div>
        <div className="captain-status-panel__stat">
          <dt>Duelo(s) registrados</dt>
          <dd>{captainStatus.historico.length}</dd>
        </div>
      </dl>

      <p className="captain-status-panel__footnote">
        Leitura atual derivada de `GET /api/groups/{'{'}groupId{'}'}/captain`,
        sem duplicar regra de negocio do backend.
      </p>
    </div>
  )
}
