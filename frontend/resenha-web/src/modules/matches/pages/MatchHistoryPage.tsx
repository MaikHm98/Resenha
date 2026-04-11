import { Link, useLocation, useParams } from 'react-router-dom'
import {
  ROUTE_PATHS,
  buildGroupMatchHistoryPath,
  buildGroupMatchesPath,
  buildMatchHistoryPath,
} from '../../../app/router/paths'
import { Alert, Button, EmptyState, Spinner } from '../../../shared/components'
import { MatchHistoryAwardsPanel } from '../components/MatchHistoryAwardsPanel'
import { MatchHistoryScoreboardPanel } from '../components/MatchHistoryScoreboardPanel'
import { MatchHistoryTeamsPanel } from '../components/MatchHistoryTeamsPanel'
import { useMatchHistoryData } from '../hooks/useMatchHistoryData'
import './MatchHistoryPage.css'

function parseMatchId(value: string | undefined): number | null {
  if (!value) {
    return null
  }

  const parsedValue = Number.parseInt(value, 10)
  return Number.isNaN(parsedValue) ? null : parsedValue
}

function readGroupIdFromLocationState(state: unknown): number | null {
  if (typeof state !== 'object' || state === null) {
    return null
  }

  const groupId = (state as { groupId?: unknown }).groupId
  return typeof groupId === 'number' && Number.isInteger(groupId) ? groupId : null
}

export function MatchHistoryPage() {
  const location = useLocation()
  const { matchId } = useParams<{ matchId: string }>()
  const currentMatchId = matchId ?? 'sem-id'
  const parsedMatchId = parseMatchId(matchId)
  const groupIdFromState = readGroupIdFromLocationState(location.state)
  const { match, status, error, isLoading, isRefreshing, refresh, clearError } =
    useMatchHistoryData(parsedMatchId)

  const isInitialLoading = status === 'idle' || status === 'loading' || isLoading
  const showFullError = status === 'error' && !match
  const resolvedGroupId = match?.idGrupo ?? groupIdFromState
  const backHistoryPath =
    resolvedGroupId !== null
      ? buildGroupMatchHistoryPath(resolvedGroupId)
      : ROUTE_PATHS.GROUPS
  const backHistoryLabel =
    resolvedGroupId !== null
      ? 'Voltar para o historico do grupo'
      : 'Voltar para grupos'

  const attendanceGroups = match
    ? [
        {
          key: 'confirmados',
          title: 'Confirmados',
          names: match.confirmadosNomes,
          emptyMessage: 'Nenhum confirmado registrado nesta partida.',
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
    : []

  return (
    <section className="match-history-page" aria-labelledby="match-history-page-title">
      <header className="match-history-page__hero">
        <div className="match-history-page__breadcrumbs">
          <Link to={ROUTE_PATHS.GROUPS}>Grupos</Link>
          {resolvedGroupId !== null ? (
            <>
              <span>/</span>
              <Link to={buildGroupMatchHistoryPath(resolvedGroupId)}>history</Link>
            </>
          ) : null}
          <span>/</span>
          <span>{currentMatchId}</span>
        </div>

        <div className="match-history-page__hero-content">
          <div>
            <p className="match-history-page__route">
              Rota ativa: {buildMatchHistoryPath(currentMatchId)}
            </p>
            <h1 className="app-title" id="match-history-page-title">
              {match
                ? `Historico da partida #${match.idPartida}`
                : 'Detalhe historico da partida'}
            </h1>
            <p className="app-subtitle">
              Esta pagina mantem a leitura historica separada do detalhe
              operacional da Fase 4 e consome apenas o snapshot devolvido por
              `GET /api/matches/{'{'}id{'}'}/details`.
            </p>
          </div>

          <div className="match-history-page__hero-actions">
            <Link
              className="match-history-page__link match-history-page__link--primary"
              to={backHistoryPath}
            >
              {backHistoryLabel}
            </Link>
            {resolvedGroupId !== null ? (
              <Link
                className="match-history-page__link"
                to={buildGroupMatchesPath(resolvedGroupId)}
              >
                Ver partidas operacionais do grupo
              </Link>
            ) : null}
            <Button
              disabled={parsedMatchId === null || isInitialLoading}
              loading={isRefreshing}
              onClick={() => void refresh()}
              type="button"
              variant="secondary"
            >
              Atualizar detalhe
            </Button>
          </div>
        </div>

        <div className="match-history-page__hero-highlights">
          <article className="match-history-page__hero-card">
            <p className="match-history-page__hero-card-label">Modo</p>
            <strong className="match-history-page__hero-card-title">
              Leitura read-only
            </strong>
            <p className="match-history-page__hero-card-copy">
              O detalhe historico nao expone presenca, convidado, exclusao,
              desafio ou votacao.
            </p>
          </article>

          <article className="match-history-page__hero-card">
            <p className="match-history-page__hero-card-label">Fonte</p>
            <strong className="match-history-page__hero-card-title">
              Snapshot da partida
            </strong>
            <p className="match-history-page__hero-card-copy">
              Esta pagina usa apenas `GET /api/matches/{'{'}id{'}'}/details`.
            </p>
          </article>

          <article className="match-history-page__hero-card">
            <p className="match-history-page__hero-card-label">Leitura segura</p>
            <strong className="match-history-page__hero-card-title">
              Sem inferencia local
            </strong>
            <p className="match-history-page__hero-card-copy">
              Placar, times e premiacoes permanecem claros mesmo quando o
              backend ainda nao devolver esses blocos.
            </p>
          </article>
        </div>
      </header>

      {error && !showFullError ? (
        <div className="match-history-page__alert-stack">
          <Alert title="Nao foi possivel concluir a atualizacao" variant="warning">
            {error}
          </Alert>
          <div className="match-history-page__alert-actions">
            <Button onClick={clearError} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      {isInitialLoading ? (
        <section
          className="match-history-page__state-panel"
          aria-label="Carregando detalhe historico da partida"
        >
          <Spinner label="Carregando detalhe historico da partida..." size="lg" />
        </section>
      ) : null}

      {!isInitialLoading && showFullError ? (
        <section
          className="match-history-page__state-panel"
          aria-label="Erro ao carregar detalhe historico da partida"
        >
          <Alert
            title="Nao foi possivel carregar esta partida"
            variant="error"
          >
            {error ?? 'Tente novamente em alguns instantes.'}
          </Alert>
          <div className="match-history-page__state-actions">
            <Button onClick={() => void refresh()} type="button">
              Tentar novamente
            </Button>
            <Link className="match-history-page__link" to={backHistoryPath}>
              {backHistoryLabel}
            </Link>
          </div>
        </section>
      ) : null}

      {!isInitialLoading && !showFullError && !match ? (
        <section
          className="match-history-page__state-panel"
          aria-label="Detalhe historico indisponivel"
        >
          <EmptyState
            action={
              <Link
                className="match-history-page__link match-history-page__link--primary"
                to={backHistoryPath}
              >
                {backHistoryLabel}
              </Link>
            }
            description="Se esta partida existir, tente atualizar a tela novamente em alguns instantes."
            title="Detalhe historico indisponivel"
          />
        </section>
      ) : null}

      {!isInitialLoading && !showFullError && match ? (
        <div className="match-history-page__content">
          <section
            className="match-history-page__panel match-history-page__panel--scoreboard"
            aria-labelledby="match-history-scoreboard-title"
          >
            <header className="match-history-page__panel-header">
              <div>
                <h2 id="match-history-scoreboard-title">Placar e contexto</h2>
                <p>
                  Resumo historico da partida sem recalcular placar, vencedor ou
                  qualquer estatistica no frontend.
                </p>
              </div>
              <span className="match-history-page__badge">Read-only</span>
            </header>

            <MatchHistoryScoreboardPanel match={match} />
          </section>

          <section
            className="match-history-page__panel match-history-page__panel--teams"
            aria-labelledby="match-history-teams-title"
          >
            <header className="match-history-page__panel-header">
              <div>
                <h2 id="match-history-teams-title">Times, capitaes e estatisticas</h2>
                <p>
                  Os times e numeros dos jogadores refletem exatamente o detalhe
                  historico recebido da API.
                </p>
              </div>
              <span className="match-history-page__badge match-history-page__badge--outline">
                Times
              </span>
            </header>

            <MatchHistoryTeamsPanel match={match} />
          </section>

          <section
            className="match-history-page__panel"
            aria-labelledby="match-history-awards-title"
          >
            <header className="match-history-page__panel-header">
              <div>
                <h2 id="match-history-awards-title">Premiacoes</h2>
                <p>
                  Leitura historica das premiacoes aprovadas ou apuradas
                  devolvidas pelo backend.
                </p>
              </div>
              <span className="match-history-page__badge match-history-page__badge--outline">
                {match.premios.length}
              </span>
            </header>

            <MatchHistoryAwardsPanel awards={match.premios} />
          </section>

          <section
            className="match-history-page__panel"
            aria-labelledby="match-history-attendance-title"
          >
            <header className="match-history-page__panel-header">
              <div>
                <h2 id="match-history-attendance-title">Participacao</h2>
                <p>
                  Confirmados, ausentes e pendentes exibidos em modo leitura,
                  sem acoes de presenca nesta pagina.
                </p>
              </div>
              <span className="match-history-page__badge match-history-page__badge--outline">
                {match.totalConfirmados}/{match.limiteVagas}
              </span>
            </header>

            <div className="match-history-attendance">
              <div className="match-history-attendance__summary">
                <div className="match-history-attendance__summary-card">
                  <span>Confirmados</span>
                  <strong>{match.totalConfirmados}</strong>
                </div>
                <div className="match-history-attendance__summary-card">
                  <span>Ausentes</span>
                  <strong>{match.totalAusentes}</strong>
                </div>
                <div className="match-history-attendance__summary-card">
                  <span>Sem resposta</span>
                  <strong>{match.naoConfirmaramNomes.length}</strong>
                </div>
              </div>

              <div className="match-history-attendance__groups">
                {attendanceGroups.map((group) => (
                  <section
                    className={[
                      'match-history-attendance__group',
                      `match-history-attendance__group--${group.key}`,
                    ].join(' ')}
                    key={group.key}
                  >
                    <header className="match-history-attendance__group-header">
                      <h3>{group.title}</h3>
                      <span>{group.names.length}</span>
                    </header>

                    {group.names.length > 0 ? (
                      <ul className="match-history-attendance__list">
                        {group.names.map((name, index) => (
                          <li
                            className="match-history-attendance__list-item"
                            key={`${group.key}-${name}-${index}`}
                          >
                            {name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="match-history-attendance__empty">
                        <p>{group.emptyMessage}</p>
                      </div>
                    )}
                  </section>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  )
}
