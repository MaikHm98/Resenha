import { Link, useParams } from 'react-router-dom'
import {
  ROUTE_PATHS,
  buildGroupCaptainPath,
  buildGroupClassificationPath,
  buildGroupDetailPath,
  buildGroupMatchesPath,
} from '../../../app/router/paths'
import { Alert, Button, Spinner } from '../../../shared/components'
import { AllTimeClassificationPanel } from '../components/AllTimeClassificationPanel'
import { ClassificationTable } from '../components/ClassificationTable'
import { MyPerformancePanel } from '../components/MyPerformancePanel'
import { useClassificationData } from '../hooks/useClassificationData'
import './ClassificationPage.css'

function parseGroupId(value: string | undefined): number | null {
  if (!value) {
    return null
  }

  const parsedValue = Number.parseInt(value, 10)
  return Number.isNaN(parsedValue) ? null : parsedValue
}

export function ClassificationPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const currentGroupId = groupId ?? 'sem-id'
  const parsedGroupId = parseGroupId(groupId)
  const {
    seasonRanking,
    allTimeRanking,
    myStats,
    status,
    error,
    allTimeError,
    myStatsError,
    hasNoActiveSeason,
    isLoading,
    isRefreshing,
    isLoadingAllTime,
    isLoadingMyStats,
    refresh,
    clearError,
  } = useClassificationData(parsedGroupId)

  const seasonEntries = seasonRanking?.classificacao ?? []
  const allTimeEntries = allTimeRanking?.classificacao ?? []
  const isInitialLoading = status === 'idle' || status === 'loading' || isLoading
  const showFullError =
    status === 'error' &&
    !seasonRanking &&
    !hasNoActiveSeason &&
    !allTimeRanking
  const isSeasonUnavailable =
    !isInitialLoading && !hasNoActiveSeason && seasonRanking === null

  return (
    <section className="classification-page" aria-labelledby="classification-page-title">
      <header className="classification-page__hero">
        <div className="classification-page__breadcrumbs">
          <Link to={ROUTE_PATHS.GROUPS}>Grupos</Link>
          <span>/</span>
          <Link to={buildGroupDetailPath(currentGroupId)}>{currentGroupId}</Link>
          <span>/</span>
          <span>classification</span>
        </div>

        <div className="classification-page__hero-content">
          <div>
            <p className="classification-page__route">
              Rota ativa: {buildGroupClassificationPath(currentGroupId)}
            </p>
            <h1 className="app-title" id="classification-page-title">
              Classificacao do grupo
            </h1>
            <p className="app-subtitle">
              Esta pagina-base prepara o modulo `classification` para receber
              leitura da temporada, ranking historico e desempenho individual,
              sempre com o backend como fonte de verdade.
            </p>
          </div>

          <div className="classification-page__hero-actions">
            <Link
              className="classification-page__link classification-page__link--primary"
              to={buildGroupDetailPath(currentGroupId)}
            >
              Voltar para o grupo
            </Link>
            <Link
              className="classification-page__link"
              to={buildGroupMatchesPath(currentGroupId)}
            >
              Ver partidas do grupo
            </Link>
            <Link
              className="classification-page__link"
              to={buildGroupCaptainPath(currentGroupId)}
            >
              Ver ciclo de capitao
            </Link>
            <Button
              disabled={parsedGroupId === null || isInitialLoading}
              loading={isRefreshing}
              onClick={() => void refresh()}
              type="button"
              variant="secondary"
            >
              Atualizar classificacao
            </Button>
          </div>
        </div>
      </header>

      {error && !showFullError ? (
        <div className="classification-page__alert-stack">
          <Alert title="Nao foi possivel concluir a atualizacao" variant="warning">
            {error}
          </Alert>
          <div className="classification-page__alert-actions">
            <Button onClick={clearError} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      <div className="classification-page__content">
        <section
          className="classification-page__panel classification-page__panel--wide"
          aria-labelledby="classification-page-foundation-title"
        >
          <header className="classification-page__panel-header">
            <div>
              <h2 id="classification-page-foundation-title">
                Base do modulo `classification`
              </h2>
              <p>
                O fluxo continua ancorado no grupo e sera alimentado pelos
                endpoints reais de classificacao, sem inventar visao global no
                frontend.
              </p>
            </div>
            <span className="classification-page__badge">Grupo</span>
          </header>

          <div className="classification-page__highlight-grid">
            <article className="classification-page__card">
              <p className="classification-page__label">Temporada</p>
              <strong className="classification-page__name">
                Ranking da temporada ativa
              </strong>
              <p className="classification-page__meta">
                Pronto para receber `GET /api/groups/{'{'}groupId{'}'}/classification`.
              </p>
            </article>

            <article className="classification-page__card">
              <p className="classification-page__label">Historico</p>
              <strong className="classification-page__name">
                Ranking geral do grupo
              </strong>
              <p className="classification-page__meta">
                Pronto para receber `GET /api/groups/{'{'}groupId{'}'}/classification/all-time`.
              </p>
            </article>

            <article className="classification-page__card">
              <p className="classification-page__label">Desempenho</p>
              <strong className="classification-page__name">
                Estatisticas do usuario logado
              </strong>
              <p className="classification-page__meta">
                Pronto para receber `GET /api/groups/{'{'}groupId{'}'}/classification/me`.
              </p>
            </article>

            <article className="classification-page__card">
              <p className="classification-page__label">Fonte de verdade</p>
              <strong className="classification-page__name">
                Backend define posicao e ordem
              </strong>
              <p className="classification-page__meta">
                O frontend nao recalcula pontos, nao reordena ranking e nao
                reconstrui posicao no cliente.
              </p>
            </article>
          </div>
        </section>

        <section
          className="classification-page__panel"
          aria-labelledby="classification-page-season-title"
        >
          <header className="classification-page__panel-header">
            <div>
              <h2 id="classification-page-season-title">Temporada</h2>
              <p>
                A leitura da temporada vai priorizar pontos, vitorias,
                derrotas e presencas, com o ranking vindo pronto da API.
              </p>
            </div>
            <span className="classification-page__badge classification-page__badge--outline">
              Leitura
            </span>
          </header>

          {isInitialLoading ? (
            <section
              className="classification-page__state-panel"
              aria-label="Carregando classificacao da temporada"
            >
              <Spinner label="Carregando classificacao da temporada..." size="lg" />
            </section>
          ) : null}

          {!isInitialLoading && showFullError ? (
            <section
              className="classification-page__state-panel"
              aria-label="Erro ao carregar classificacao da temporada"
            >
              <Alert
                title="Nao foi possivel carregar a classificacao"
                variant="error"
              >
                {error ?? 'Tente novamente em alguns instantes.'}
              </Alert>
              <div className="classification-page__state-actions">
                <Button onClick={() => void refresh()} type="button">
                  Tentar novamente
                </Button>
              </div>
            </section>
          ) : null}

          {!isInitialLoading && !showFullError && hasNoActiveSeason ? (
            <div className="classification-page__placeholder">
              <h3>Temporada indisponivel</h3>
              <p>
                O backend informou que este grupo ainda nao possui temporada
                ativa. A estrutura da pagina permanece pronta para historico e
                desempenho individual nos proximos commits.
              </p>
            </div>
          ) : null}

          {!isInitialLoading && !showFullError && isSeasonUnavailable ? (
            <div className="classification-page__placeholder">
              <h3>Temporada temporariamente indisponivel</h3>
              <p>
                A leitura da temporada nao ficou disponivel agora, mas a pagina
                continua utilizavel e o ranking historico do grupo permanece
                acessivel.
              </p>
            </div>
          ) : null}

          {!isInitialLoading &&
          !showFullError &&
          !hasNoActiveSeason &&
          seasonRanking !== null ? (
            <ClassificationTable entries={seasonEntries} />
          ) : null}
        </section>

        <section
          className="classification-page__panel"
          aria-labelledby="classification-page-all-time-title"
        >
          <header className="classification-page__panel-header">
            <div>
              <h2 id="classification-page-all-time-title">Ranking historico</h2>
              <p>
                O ranking geral do grupo sera exibido separadamente da
                temporada ativa, sem misturar regras ou recalculos locais.
              </p>
            </div>
            <span className="classification-page__badge classification-page__badge--outline">
              Historico
            </span>
          </header>

          {isInitialLoading ? (
            <section
              className="classification-page__state-panel"
              aria-label="Carregando ranking historico"
            >
              <Spinner label="Carregando ranking historico..." size="lg" />
            </section>
          ) : null}

          {!isInitialLoading && !showFullError ? (
            <AllTimeClassificationPanel
              entries={allTimeEntries}
              error={allTimeError}
              isLoading={isLoadingAllTime}
            />
          ) : null}
        </section>

        <section
          className="classification-page__panel classification-page__panel--wide"
          aria-labelledby="classification-page-performance-title"
        >
          <header className="classification-page__panel-header">
            <div>
              <h2 id="classification-page-performance-title">
                Desempenho individual
              </h2>
              <p>
                A leitura individual sera separada do ranking coletivo para
                deixar claros pontos, vitorias, derrotas e presencas do usuario
                logado.
              </p>
            </div>
            <span className="classification-page__badge classification-page__badge--outline">
              Meu desempenho
            </span>
          </header>

          {isInitialLoading ? (
            <section
              className="classification-page__state-panel"
              aria-label="Preparando desempenho individual"
            >
              <Spinner
                label="Preparando o desempenho individual..."
                size="lg"
              />
            </section>
          ) : null}

          {!isInitialLoading && showFullError ? (
            <section
              className="classification-page__state-panel"
              aria-label="Desempenho individual indisponivel"
            >
              <Alert title="Desempenho individual indisponivel" variant="warning">
                Carregue a classificacao da temporada com sucesso para consultar
                o painel individual deste grupo.
              </Alert>
            </section>
          ) : null}

          {!isInitialLoading && !showFullError && isSeasonUnavailable ? (
            <section
              className="classification-page__state-panel"
              aria-label="Desempenho individual temporariamente indisponivel"
            >
              <Alert title="Desempenho individual temporariamente indisponivel" variant="warning">
                O painel individual depende da leitura da temporada atual. O
                ranking historico do grupo continua disponivel nesta pagina.
              </Alert>
            </section>
          ) : null}

          {!isInitialLoading &&
          !showFullError &&
          !isSeasonUnavailable ? (
            <MyPerformancePanel
              hasNoActiveSeason={hasNoActiveSeason}
              isLoading={isLoadingMyStats}
              myStats={myStats}
              myStatsError={myStatsError}
            />
          ) : null}
        </section>
      </div>
    </section>
  )
}
