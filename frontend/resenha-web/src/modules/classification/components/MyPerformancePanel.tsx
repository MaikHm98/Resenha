import { Alert, Spinner } from '../../../shared/components'
import type {
  ClassificationEntry,
  MyClassificationStats,
} from '../types/classificationContracts'

type MyPerformancePanelProps = {
  myStats: MyClassificationStats | null
  myStatsError: string | null
  hasNoActiveSeason: boolean
  isLoading: boolean
}

type PerformanceCardProps = {
  title: string
  entry: ClassificationEntry | null
  emptyMessage: string
}

function PerformanceCard({
  title,
  entry,
  emptyMessage,
}: PerformanceCardProps) {
  return (
    <article className="my-performance-panel__card">
      <header className="my-performance-panel__card-header">
        <h3>{title}</h3>
        {entry ? (
          <span className="my-performance-panel__badge">#{entry.posicao}</span>
        ) : null}
      </header>

      {entry ? (
        <dl className="my-performance-panel__stats">
          <div className="my-performance-panel__stat">
            <dt>Posicao</dt>
            <dd>{entry.posicao}</dd>
          </div>
          <div className="my-performance-panel__stat">
            <dt>Pontos</dt>
            <dd>{entry.pontos}</dd>
          </div>
          <div className="my-performance-panel__stat">
            <dt>Vitorias</dt>
            <dd>{entry.vitorias}</dd>
          </div>
          <div className="my-performance-panel__stat">
            <dt>Derrotas</dt>
            <dd>{entry.derrotas}</dd>
          </div>
          <div className="my-performance-panel__stat">
            <dt>Presencas</dt>
            <dd>{entry.presencas}</dd>
          </div>
        </dl>
      ) : (
        <div className="my-performance-panel__empty">
          <p>{emptyMessage}</p>
        </div>
      )}
    </article>
  )
}

export function MyPerformancePanel({
  myStats,
  myStatsError,
  hasNoActiveSeason,
  isLoading,
}: MyPerformancePanelProps) {
  if (isLoading) {
    return (
      <section
        className="my-performance-panel__state"
        aria-label="Carregando desempenho individual"
      >
        <Spinner label="Carregando desempenho individual..." size="lg" />
      </section>
    )
  }

  if (hasNoActiveSeason) {
    return (
      <div className="my-performance-panel__empty my-performance-panel__empty--season">
        <h3>Desempenho individual indisponivel</h3>
        <p>
          O endpoint `classification/me` depende da temporada ativa no backend.
          Enquanto ela nao existir, este painel permanece indisponivel com
          seguranca.
        </p>
      </div>
    )
  }

  return (
    <div className="my-performance-panel">
      {myStatsError ? (
        <Alert title="Nao foi possivel carregar seu desempenho" variant="warning">
          {myStatsError}
        </Alert>
      ) : null}

      <div className="my-performance-panel__grid">
        <PerformanceCard
          emptyMessage="O backend nao devolveu estatisticas individuais da temporada para este usuario."
          entry={myStats?.temporada ?? null}
          title="Temporada atual"
        />
        <PerformanceCard
          emptyMessage="O backend nao devolveu estatisticas gerais deste usuario no grupo."
          entry={myStats?.geral ?? null}
          title="Geral do grupo"
        />
      </div>
    </div>
  )
}
