import { Link, useParams } from 'react-router-dom'
import {
  ROUTE_PATHS,
  buildMatchChallengePath,
  buildMatchDetailPath,
} from '../../../app/router/paths'
import { Alert, Button, EmptyState, Spinner } from '../../../shared/components'
import { ChallengeAlertsPanel } from '../components/ChallengeAlertsPanel'
import { ChallengeGoalkeeperSection } from '../components/ChallengeGoalkeeperSection'
import { ChallengeLineDrawSection } from '../components/ChallengeLineDrawSection'
import { ChallengeLinePicksSection } from '../components/ChallengeLinePicksSection'
import { ChallengeStatusPanel } from '../components/ChallengeStatusPanel'
import { ChallengeTeamsPanel } from '../components/ChallengeTeamsPanel'
import { useMatchChallengeData } from '../hooks/useMatchChallengeData'
import './MatchChallengePage.css'

function parseMatchId(value: string | undefined): number | null {
  if (!value) {
    return null
  }

  const parsedValue = Number.parseInt(value, 10)
  return Number.isNaN(parsedValue) ? null : parsedValue
}

export function MatchChallengePage() {
  const { matchId } = useParams<{ matchId: string }>()
  const currentMatchId = matchId ?? 'sem-id'
  const parsedMatchId = parseMatchId(matchId)
  const {
    challenge,
    status,
    error,
    lineDrawError,
    lineDrawNotice,
    linePickError,
    linePickNotice,
    goalkeeperError,
    goalkeeperNotice,
    activeLineDrawAction,
    activeGoalkeeperAction,
    activeLinePickPlayerId,
    activeGoalkeeperPickPlayerId,
    isLoading,
    isRefreshing,
    isSubmittingLineDraw,
    isPickingLinePlayer,
    isSubmittingGoalkeeper,
    isPickingGoalkeeper,
    refresh,
    startLineDraw,
    submitLineDrawNumber,
    pickLinePlayer,
    startGoalkeeperDraw,
    submitGoalkeeperDrawNumber,
    pickGoalkeeper,
    clearError,
    clearLineDrawFeedback,
    clearLinePickFeedback,
    clearGoalkeeperFeedback,
  } = useMatchChallengeData(parsedMatchId)

  const isInitialLoading = status === 'idle' || status === 'loading' || isLoading
  const showFullError = status === 'error' && !challenge

  return (
    <section className="match-challenge-page" aria-labelledby="match-challenge-page-title">
      <header className="match-challenge-page__hero">
        <div className="match-challenge-page__breadcrumbs">
          <Link to={ROUTE_PATHS.MATCHES}>Partidas</Link>
          <span>/</span>
          <Link to={buildMatchDetailPath(currentMatchId)}>{currentMatchId}</Link>
          <span>/</span>
          <span>challenge</span>
        </div>

        <div className="match-challenge-page__hero-content">
          <div>
            <p className="match-challenge-page__route">
              Rota ativa: {buildMatchChallengePath(currentMatchId)}
            </p>
            <h1 className="app-title" id="match-challenge-page-title">
              Desafio em andamento
            </h1>
            <p className="app-subtitle">
              Esta pagina-base separa o fluxo sensivel de desafio do detalhe da
              partida e prepara o modulo `matches` para receber snapshot,
              etapas, picks, goleiros, paridade, bloqueios e alertas nos
              proximos commits.
            </p>
          </div>

          <div className="match-challenge-page__hero-actions">
            <Link
              className="match-challenge-page__link match-challenge-page__link--primary"
              to={buildMatchDetailPath(currentMatchId)}
            >
              Voltar para a partida
            </Link>
            <Link className="match-challenge-page__link" to={ROUTE_PATHS.MATCHES}>
              Voltar para o modulo
            </Link>
            <Button
              disabled={parsedMatchId === null || isInitialLoading}
              loading={isRefreshing}
              onClick={() => void refresh()}
              type="button"
              variant="secondary"
            >
              Atualizar snapshot
            </Button>
          </div>
        </div>
      </header>

      {error && !showFullError ? (
        <div className="match-challenge-page__alert-stack">
          <Alert title="Nao foi possivel concluir a atualizacao" variant="warning">
            {error}
          </Alert>
          <div className="match-challenge-page__alert-actions">
            <Button onClick={clearError} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      {isInitialLoading ? (
        <section
          className="match-challenge-page__state-panel"
          aria-label="Carregando snapshot do desafio"
        >
          <Spinner label="Carregando snapshot do desafio..." size="lg" />
        </section>
      ) : null}

      {!isInitialLoading && showFullError ? (
        <section
          className="match-challenge-page__state-panel"
          aria-label="Erro ao carregar snapshot do desafio"
        >
          <Alert title="Nao foi possivel carregar este desafio" variant="error">
            {error ?? 'Tente novamente em alguns instantes.'}
          </Alert>
          <div className="match-challenge-page__state-actions">
            <Button onClick={() => void refresh()} type="button">
              Tentar novamente
            </Button>
            <Link
              className="match-challenge-page__link"
              to={buildMatchDetailPath(currentMatchId)}
            >
              Voltar para a partida
            </Link>
          </div>
        </section>
      ) : null}

      {!isInitialLoading && !showFullError && !challenge ? (
        <section
          className="match-challenge-page__state-panel"
          aria-label="Snapshot indisponivel"
        >
          <EmptyState
            action={
              <Link
                className="match-challenge-page__link match-challenge-page__link--primary"
                to={buildMatchDetailPath(currentMatchId)}
              >
                Voltar para a partida
              </Link>
            }
            description="Se este desafio existir, tente atualizar o snapshot novamente em alguns instantes."
            title="Snapshot do desafio indisponivel"
          />
        </section>
      ) : null}

      {!isInitialLoading && !showFullError && challenge ? (
        <div className="match-challenge-page__content">
          <section
            className="match-challenge-page__panel match-challenge-page__panel--wide"
            aria-labelledby="match-challenge-snapshot-title"
          >
            <header className="match-challenge-page__panel-header">
              <div>
                <h2 id="match-challenge-snapshot-title">Snapshot do desafio</h2>
                <p>
                  Leitura direta do snapshot do backend, sem antecipar regra de
                  negocio nem inferir estados fora do que a API devolve.
                </p>
              </div>
              <span className="match-challenge-page__badge">Leitura</span>
            </header>

            <ChallengeStatusPanel challenge={challenge} />
          </section>

          <section
            className="match-challenge-page__panel"
            aria-labelledby="match-challenge-line-title"
          >
            <header className="match-challenge-page__panel-header">
              <div>
                <h2 id="match-challenge-line-title">Jogadores de linha</h2>
                <p>
                  Lista devolvida pelo backend com jogadores de linha disponiveis
                  neste snapshot.
                </p>
              </div>
              <span className="match-challenge-page__badge match-challenge-page__badge--outline">
                Linha
              </span>
            </header>

            <ChallengeLineDrawSection
              activeAction={activeLineDrawAction}
              challenge={challenge}
              isSubmitting={isSubmittingLineDraw}
              lineDrawError={lineDrawError}
              lineDrawNotice={lineDrawNotice}
              onClearFeedback={clearLineDrawFeedback}
              onStartLineDraw={startLineDraw}
              onSubmitLineDrawNumber={submitLineDrawNumber}
            />

            <ChallengeLinePicksSection
              activeLinePickPlayerId={activeLinePickPlayerId}
              challenge={challenge}
              isPickingLinePlayer={isPickingLinePlayer}
              linePickError={linePickError}
              linePickNotice={linePickNotice}
              onClearFeedback={clearLinePickFeedback}
              onPickLinePlayer={pickLinePlayer}
            />
          </section>

          <section
            className="match-challenge-page__panel"
            aria-labelledby="match-challenge-goalkeeper-title"
          >
            <header className="match-challenge-page__panel-header">
              <div>
                <h2 id="match-challenge-goalkeeper-title">Goleiros</h2>
                <p>
                  Etapa sensivel de goleiros, respeitando apenas flags, alertas
                  e bloqueios do snapshot atual.
                </p>
              </div>
              <span className="match-challenge-page__badge match-challenge-page__badge--outline">
                Goleiros
              </span>
            </header>

            <ChallengeGoalkeeperSection
              activeAction={activeGoalkeeperAction}
              activeGoalkeeperPickPlayerId={activeGoalkeeperPickPlayerId}
              challenge={challenge}
              goalkeeperError={goalkeeperError}
              goalkeeperNotice={goalkeeperNotice}
              isPickingGoalkeeper={isPickingGoalkeeper}
              isSubmittingGoalkeeper={isSubmittingGoalkeeper}
              onClearFeedback={clearGoalkeeperFeedback}
              onPickGoalkeeper={pickGoalkeeper}
              onStartGoalkeeperDraw={startGoalkeeperDraw}
              onSubmitGoalkeeperDrawNumber={submitGoalkeeperDrawNumber}
            />
          </section>

          <section
            className="match-challenge-page__panel"
            aria-labelledby="match-challenge-teams-title"
          >
            <header className="match-challenge-page__panel-header">
              <div>
                <h2 id="match-challenge-teams-title">Jogadores ja escolhidos</h2>
                <p>
                  Times e escolhas ja materializadas no snapshot atual, sem
                  executar picks neste commit.
                </p>
              </div>
              <span className="match-challenge-page__badge match-challenge-page__badge--outline">
                Times
              </span>
            </header>

            <ChallengeTeamsPanel challenge={challenge} />
          </section>

          <section
            className="match-challenge-page__panel match-challenge-page__panel--wide"
            aria-labelledby="match-challenge-alerts-title"
          >
            <header className="match-challenge-page__panel-header">
              <div>
                <h2 id="match-challenge-alerts-title">Bloqueios e alertas</h2>
                <p>
                  Lista devolvida pelo backend para leitura do estado atual do
                  desafio.
                </p>
              </div>
              <span className="match-challenge-page__badge match-challenge-page__badge--danger">
                Sensivel
              </span>
            </header>

            <ChallengeAlertsPanel
              alertas={challenge.alertas}
              bloqueios={challenge.bloqueios}
              isManualGoalkeeperState={
                challenge.statusDesafio === 'DEFINICAO_MANUAL_GOLEIRO' ||
                challenge.requerDefinicaoManualGoleiro
              }
            />
          </section>
        </div>
      ) : null}
    </section>
  )
}
