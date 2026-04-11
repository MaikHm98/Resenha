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
          <span>Classificacao</span>
        </div>

        <div className="classification-page__hero-content">
          <div>
            <p className="classification-page__route">
              Grupo em campo: {buildGroupClassificationPath(currentGroupId)}
            </p>
            <h1 className="app-title" id="classification-page-title">
              Classificacao do grupo
            </h1>
            <p className="app-subtitle">
              Veja a temporada, o historico do grupo e o seu desempenho sem sair da resenha.
            </p>
          </div>

          <div className="classification-page__hero-actions">
            <Link
              className="classification-page__link classification-page__link--primary"
              to={buildGroupDetailPath(currentGroupId)}
            >
              Voltar ao grupo
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
              Atualizar tabela
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
                Panorama da classificacao
              </h2>
              <p>
                A classificacao do grupo fica reunida aqui para facilitar a leitura da temporada, do historico e do seu momento no campeonato.
              </p>
            </div>
            <span className="classification-page__badge">Grupo</span>
          </header>

          <div className="classification-page__highlight-grid">
            <article className="classification-page__card">
              <p className="classification-page__label">Temporada</p>
              <strong className="classification-page__name">
                Tabela da temporada ativa
              </strong>
              <p className="classification-page__meta">
                Pontos, vitorias, derrotas e presencas do grupo aparecem aqui.
              </p>
            </article>

            <article className="classification-page__card">
              <p className="classification-page__label">Historico</p>
              <strong className="classification-page__name">
                Ranking geral do grupo
              </strong>
              <p className="classification-page__meta">
                O historico do grupo fica separado para mostrar a caminhada completa da resenha.
              </p>
            </article>

            <article className="classification-page__card">
              <p className="classification-page__label">Seu jogo</p>
              <strong className="classification-page__name">
                Seu desempenho na temporada
              </strong>
              <p className="classification-page__meta">
                Veja a sua posicao, pontos e presencas no contexto do grupo.
              </p>
            </article>

            <article className="classification-page__card">
              <p className="classification-page__label">Leitura fiel</p>
              <strong className="classification-page__name">
                Posicoes vindas da API
              </strong>
              <p className="classification-page__meta">
                A web apenas reflete a classificacao devolvida pela API do grupo.
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
                A tabela da temporada atual fica pronta para consulta assim que a classificacao do grupo estiver disponivel.
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
                Este grupo ainda nao tem temporada ativa. Enquanto isso, o historico continua disponivel logo abaixo.
              </p>
            </div>
          ) : null}

          {!isInitialLoading && !showFullError && isSeasonUnavailable ? (
            <div className="classification-page__placeholder">
              <h3>Temporada temporariamente indisponivel</h3>
              <p>
                A leitura da temporada nao ficou disponivel agora, mas o ranking historico do grupo continua acessivel.
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
                O historico do grupo aparece separado da temporada atual para manter a leitura clara.
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
                Seu painel individual acompanha a mesma classificacao do grupo para destacar seu momento na temporada.
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
                Assim que a tabela da temporada estiver disponivel, o seu painel individual volta a aparecer aqui.
              </Alert>
            </section>
          ) : null}

          {!isInitialLoading && !showFullError && isSeasonUnavailable ? (
            <section
              className="classification-page__state-panel"
              aria-label="Desempenho individual temporariamente indisponivel"
            >
              <Alert title="Desempenho individual temporariamente indisponivel" variant="warning">
                O painel individual depende da temporada atual. O ranking historico do grupo continua disponivel nesta pagina.
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
