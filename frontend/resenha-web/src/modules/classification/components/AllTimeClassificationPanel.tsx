import { Alert, Spinner } from '../../../shared/components'
import { ClassificationTable } from './ClassificationTable'
import type { ClassificationEntry } from '../types/classificationContracts'

type AllTimeClassificationPanelProps = {
  entries: ClassificationEntry[]
  error: string | null
  isLoading: boolean
}

export function AllTimeClassificationPanel({
  entries,
  error,
  isLoading,
}: AllTimeClassificationPanelProps) {
  if (isLoading) {
    return (
      <section
        className="all-time-classification-panel__state"
        aria-label="Carregando ranking historico"
      >
        <Spinner label="Carregando ranking historico..." size="lg" />
      </section>
    )
  }

  if (error && entries.length === 0) {
    return (
      <section
        className="all-time-classification-panel__state"
        aria-label="Ranking historico indisponivel"
      >
        <Alert title="Nao foi possivel carregar o ranking historico" variant="warning">
          {error}
        </Alert>
      </section>
    )
  }

  return (
    <div className="all-time-classification-panel">
      {error ? (
        <Alert title="Ranking historico parcialmente desatualizado" variant="warning">
          {error}
        </Alert>
      ) : null}

      {entries.length === 0 ? (
        <div className="classification-table__empty">
          <h3>Ranking historico sem classificados</h3>
          <p>
            O backend nao devolveu jogadores classificados no ranking
            historico deste grupo no momento.
          </p>
        </div>
      ) : (
        <ClassificationTable entries={entries} />
      )}
    </div>
  )
}
