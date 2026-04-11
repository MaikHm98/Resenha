import { Link, useParams } from 'react-router-dom'
import {
  ROUTE_PATHS,
  buildGroupDetailPath,
  buildGroupMatchHistoryPath,
  buildGroupMatchesPath,
} from '../../../app/router/paths'
import { Alert, Button, EmptyState, Spinner } from '../../../shared/components'
import { MatchHistoryCard } from '../components/MatchHistoryCard'
import { MatchHistoryFilters } from '../components/MatchHistoryFilters'
import { useGroupMatchHistoryData } from '../hooks/useGroupMatchHistoryData'
import './GroupMatchHistoryPage.css'

function parseGroupId(value: string | undefined): number | null {
  if (!value) {
    return null
  }

  const parsedValue = Number.parseInt(value, 10)
  return Number.isNaN(parsedValue) ? null : parsedValue
}

export function GroupMatchHistoryPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const currentGroupId = groupId ?? 'sem-id'
  const parsedGroupId = parseGroupId(groupId)
  const {
    history,
    filteredHistory,
    status,
    error,
    searchTerm,
    statusFilter,
    hasActiveFilters,
    isLoading,
    isRefreshing,
    updateSearchTerm,
    updateStatusFilter,
    clearFilters,
    refresh,
    clearError,
  } = useGroupMatchHistoryData(parsedGroupId)

  const hasHistory = history.length > 0
  const hasFilteredHistory = filteredHistory.length > 0
  const isInitialLoading = status === 'idle' || status === 'loading' || isLoading
  const showFullError = status === 'error' && !hasHistory

  return (
    <section
      className="group-match-history-page"
      aria-labelledby="group-match-history-page-title"
    >
      <header className="group-match-history-page__hero">
        <div className="group-match-history-page__breadcrumbs">
          <Link to={ROUTE_PATHS.GROUPS}>Grupos</Link>
          <span>/</span>
          <Link to={buildGroupDetailPath(currentGroupId)}>{currentGroupId}</Link>
          <span>/</span>
          <Link to={buildGroupMatchesPath(currentGroupId)}>matches</Link>
          <span>/</span>
          <span>history</span>
        </div>

        <div className="group-match-history-page__hero-content">
          <div>
            <p className="group-match-history-page__route">
              Rota ativa: {buildGroupMatchHistoryPath(currentGroupId)}
            </p>
            <h1 className="app-title" id="group-match-history-page-title">
              Historico de partidas
            </h1>
            <p className="app-subtitle">
              Esta pagina separa a leitura historica da operacao basica do
              modulo `matches`, consumindo apenas o resumo devolvido pelo
              backend para este grupo.
            </p>
          </div>

          <div className="group-match-history-page__hero-actions">
            <Link
              className="group-match-history-page__link group-match-history-page__link--primary"
              to={buildGroupDetailPath(currentGroupId)}
            >
              Voltar para o grupo
            </Link>
            <Link
              className="group-match-history-page__link"
              to={buildGroupMatchesPath(currentGroupId)}
            >
              Ver partidas operacionais
            </Link>
            <Button
              disabled={parsedGroupId === null || isInitialLoading}
              loading={isRefreshing}
              onClick={() => void refresh()}
              type="button"
              variant="secondary"
            >
              Atualizar historico
            </Button>
          </div>
        </div>

        <div className="group-match-history-page__hero-highlights">
          <article className="group-match-history-page__hero-card">
            <p className="group-match-history-page__hero-card-label">Modo</p>
            <strong className="group-match-history-page__hero-card-title">
              Historico read-only
            </strong>
            <p className="group-match-history-page__hero-card-copy">
              Esta rota nao expone presenca, convidado, exclusao, desafio ou
              votacao.
            </p>
          </article>

          <article className="group-match-history-page__hero-card">
            <p className="group-match-history-page__hero-card-label">Fonte</p>
            <strong className="group-match-history-page__hero-card-title">
              Snapshot do grupo
            </strong>
            <p className="group-match-history-page__hero-card-copy">
              A leitura usa apenas `GET /api/groups/{'{'}groupId{'}'}/matches/history`.
            </p>
          </article>

          <article className="group-match-history-page__hero-card">
            <p className="group-match-history-page__hero-card-label">Filtros</p>
            <strong className="group-match-history-page__hero-card-title">
              Somente locais
            </strong>
            <p className="group-match-history-page__hero-card-copy">
              Busca e status atuam apenas sobre a lista carregada nesta tela.
            </p>
          </article>
        </div>
      </header>

      {error && !showFullError ? (
        <div className="group-match-history-page__alert-stack">
          <Alert title="Nao foi possivel concluir a atualizacao" variant="warning">
            {error}
          </Alert>
          <div className="group-match-history-page__alert-actions">
            <Button onClick={clearError} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      <section
        className="group-match-history-page__panel"
        aria-labelledby="group-match-history-list-title"
      >
        <header className="group-match-history-page__panel-header">
          <div>
            <h2 id="group-match-history-list-title">Partidas do grupo em leitura</h2>
            <p>
              Listagem carregada via `GET /api/groups/{'{'}groupId{'}'}/matches/history`,
              sem misturar presenca, criacao, convidado, exclusao ou outras
              acoes operacionais.
            </p>
          </div>
          <span className="group-match-history-page__badge">
            {hasHistory
              ? hasActiveFilters
                ? `${filteredHistory.length}/${history.length}`
                : history.length
              : 'Historico'}
          </span>
        </header>

        {isInitialLoading ? (
          <section
            className="group-match-history-page__state-panel"
            aria-label="Carregando historico de partidas"
          >
            <Spinner label="Carregando historico de partidas..." size="lg" />
          </section>
        ) : null}

        {!isInitialLoading && showFullError ? (
          <section
            className="group-match-history-page__state-panel"
            aria-label="Erro ao carregar historico de partidas"
          >
            <Alert
              title="Nao foi possivel carregar o historico deste grupo"
              variant="error"
            >
              {error ?? 'Tente novamente em alguns instantes.'}
            </Alert>
            <div className="group-match-history-page__state-actions">
              <Button onClick={() => void refresh()} type="button">
                Tentar novamente
              </Button>
              <Link
                className="group-match-history-page__link"
                to={buildGroupMatchesPath(currentGroupId)}
              >
                Voltar para partidas do grupo
              </Link>
            </div>
          </section>
        ) : null}

        {!isInitialLoading && !showFullError ? (
          <>
            {hasHistory ? (
              <>
                <MatchHistoryFilters
                  filteredCount={filteredHistory.length}
                  hasActiveFilters={hasActiveFilters}
                  onClearFilters={clearFilters}
                  onSearchTermChange={updateSearchTerm}
                  onStatusFilterChange={updateStatusFilter}
                  searchTerm={searchTerm}
                  statusFilter={statusFilter}
                  totalCount={history.length}
                />

                {hasFilteredHistory ? (
                  <ul className="group-match-history-page__list">
                    {filteredHistory.map((match) => (
                      <MatchHistoryCard
                        groupId={parsedGroupId}
                        key={match.idPartida}
                        match={match}
                      />
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    action={
                      hasActiveFilters ? (
                        <Button onClick={clearFilters} type="button" variant="secondary">
                          Limpar filtros
                        </Button>
                      ) : undefined
                    }
                    description="Nenhuma partida da lista carregada corresponde aos filtros atuais."
                    title="Nenhum resultado para os filtros"
                  />
                )}
              </>
            ) : (
              <EmptyState
                action={
                  <Link
                    className="group-match-history-page__link group-match-history-page__link--primary"
                    to={buildGroupMatchesPath(currentGroupId)}
                  >
                    Ver partidas operacionais
                  </Link>
                }
                description="Assim que o grupo acumular partidas no historico, a leitura resumida aparecera aqui."
                title="Nenhuma partida no historico"
              />
            )}
          </>
        ) : null}
      </section>
    </section>
  )
}
