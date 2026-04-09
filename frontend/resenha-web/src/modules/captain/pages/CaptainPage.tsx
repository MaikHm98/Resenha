import { Link, useParams } from 'react-router-dom'
import {
  ROUTE_PATHS,
  buildGroupCaptainPath,
  buildGroupDetailPath,
  buildGroupMatchesPath,
} from '../../../app/router/paths'
import { Alert, Button, Spinner } from '../../../shared/components'
import { CaptainCycleEmptyState } from '../components/CaptainCycleEmptyState'
import { ChallengeResultSection } from '../components/ChallengeResultSection'
import { LaunchChallengeSection } from '../components/LaunchChallengeSection'
import { CaptainStatusPanel } from '../components/CaptainStatusPanel'
import { useCaptainData } from '../hooks/useCaptainData'
import './CaptainPage.css'

function parseGroupId(value: string | undefined): number | null {
  if (!value) {
    return null
  }

  const parsedValue = Number.parseInt(value, 10)
  return Number.isNaN(parsedValue) ? null : parsedValue
}

export function CaptainPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const currentGroupId = groupId ?? 'sem-id'
  const parsedGroupId = parseGroupId(groupId)
  const {
    captainStatus,
    status,
    error,
    openCycleError,
    openCycleNotice,
    groupMatches,
    eligibleChallengers,
    selectedMatchId,
    matchesError,
    eligibleError,
    launchChallengeError,
    launchChallengeNotice,
    resultError,
    resultNotice,
    hasNoCycle,
    isAdmin,
    isCurrentCaptain,
    isLoading,
    isRefreshing,
    isOpeningCycle,
    isLoadingMatches,
    isLoadingEligibleChallengers,
    isLaunchingChallenge,
    isRegisteringResult,
    refresh,
    openCycle,
    selectMatch,
    launchChallenge,
    registerChallengeResult,
    clearError,
    clearOpenCycleFeedback,
    clearLaunchChallengeFeedback,
    clearResultFeedback,
  } = useCaptainData(parsedGroupId)

  const isInitialLoading = status === 'idle' || status === 'loading' || isLoading
  const showFullError = status === 'error' && !captainStatus && !hasNoCycle

  return (
    <section className="captain-page" aria-labelledby="captain-page-title">
      <header className="captain-page__hero">
        <div className="captain-page__breadcrumbs">
          <Link to={ROUTE_PATHS.GROUPS}>Grupos</Link>
          <span>/</span>
          <Link to={buildGroupDetailPath(currentGroupId)}>{currentGroupId}</Link>
          <span>/</span>
          <span>captain</span>
        </div>

        <div className="captain-page__hero-content">
          <div>
            <p className="captain-page__route">
              Rota ativa: {buildGroupCaptainPath(currentGroupId)}
            </p>
            <h1 className="app-title" id="captain-page-title">
              Ciclo de capitao
            </h1>
            <p className="app-subtitle">
              Esta pagina-base prepara o fluxo de capitao por grupo para
              receber status do ciclo, elegiveis por partida, escolha de
              desafiante e registro de resultado nos proximos commits.
            </p>
          </div>

          <div className="captain-page__hero-actions">
            <Link
              className="captain-page__link captain-page__link--primary"
              to={buildGroupDetailPath(currentGroupId)}
            >
              Voltar para o grupo
            </Link>
            <Link
              className="captain-page__link"
              to={buildGroupMatchesPath(currentGroupId)}
            >
              Ver partidas do grupo
            </Link>
            <Button
              disabled={parsedGroupId === null || isInitialLoading}
              loading={isRefreshing}
              onClick={() => void refresh()}
              type="button"
              variant="secondary"
            >
              Atualizar ciclo
            </Button>
          </div>
        </div>
      </header>

      {error && !showFullError ? (
        <div className="captain-page__alert-stack">
          <Alert title="Nao foi possivel concluir a atualizacao" variant="warning">
            {error}
          </Alert>
          <div className="captain-page__alert-actions">
            <Button onClick={clearError} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      {openCycleNotice || openCycleError ? (
        <div className="captain-page__alert-stack">
          {openCycleNotice ? (
            <Alert title="Ciclo atualizado" variant="success">
              {openCycleNotice}
            </Alert>
          ) : null}
          {openCycleError ? (
            <Alert title="Nao foi possivel iniciar o ciclo" variant="error">
              {openCycleError}
            </Alert>
          ) : null}
          <div className="captain-page__alert-actions">
            <Button
              onClick={clearOpenCycleFeedback}
              type="button"
              variant="secondary"
            >
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      <div className="captain-page__content">
        <section
          className="captain-page__panel"
          aria-labelledby="captain-page-status-title"
        >
          <header className="captain-page__panel-header">
            <div>
              <h2 id="captain-page-status-title">Base do status do ciclo</h2>
              <p>
                O modulo vai trabalhar ancorado em
                `GET /api/groups/{'{'}groupId{'}'}/captain`, tratando leitura,
                abertura de ciclo e atualizacao segura do estado.
              </p>
            </div>
            <span className="captain-page__badge">Grupo</span>
          </header>

          {isInitialLoading ? (
            <section
              className="captain-page__state-panel"
              aria-label="Carregando ciclo de capitao"
            >
              <Spinner label="Carregando ciclo de capitao..." size="lg" />
            </section>
          ) : null}

          {!isInitialLoading && showFullError ? (
            <section
              className="captain-page__state-panel"
              aria-label="Erro ao carregar ciclo de capitao"
            >
              <Alert title="Nao foi possivel carregar este ciclo" variant="error">
                {error ?? 'Tente novamente em alguns instantes.'}
              </Alert>
              <div className="captain-page__state-actions">
                <Button onClick={() => void refresh()} type="button">
                  Tentar novamente
                </Button>
                <Link className="captain-page__link" to={buildGroupDetailPath(currentGroupId)}>
                  Voltar para o grupo
                </Link>
              </div>
            </section>
          ) : null}

          {!isInitialLoading && !showFullError && hasNoCycle ? (
            <CaptainCycleEmptyState
              isAdmin={isAdmin}
              isSubmitting={isOpeningCycle}
              onOpenCycle={openCycle}
            />
          ) : null}

          {!isInitialLoading && !showFullError && captainStatus ? (
            <CaptainStatusPanel captainStatus={captainStatus} />
          ) : null}
        </section>

        <section
          className="captain-page__panel"
          aria-labelledby="captain-page-launch-title"
        >
          {isInitialLoading ? (
            <section
              className="captain-page__state-panel"
              aria-label="Preparando fluxo de desafiante"
            >
              <Spinner
                label="Preparando o contexto para escolha de desafiante..."
                size="lg"
              />
            </section>
          ) : null}

          {!isInitialLoading && showFullError ? (
            <section
              className="captain-page__state-panel"
              aria-label="Fluxo de desafiante indisponivel"
            >
              <Alert title="Fluxo de desafiante indisponivel" variant="warning">
                Carregue o status do ciclo com sucesso para habilitar a selecao
                da partida e dos elegiveis.
              </Alert>
            </section>
          ) : null}

          {!isInitialLoading && !showFullError ? (
            <LaunchChallengeSection
              captainStatus={captainStatus}
              eligibleChallengers={eligibleChallengers}
              eligibleError={eligibleError}
              groupMatches={groupMatches}
              hasNoCycle={hasNoCycle}
              isCurrentCaptain={isCurrentCaptain}
              isLaunchingChallenge={isLaunchingChallenge}
              isLoadingEligibleChallengers={isLoadingEligibleChallengers}
              isLoadingMatches={isLoadingMatches}
              launchChallengeError={launchChallengeError}
              launchChallengeNotice={launchChallengeNotice}
              matchesError={matchesError}
              onClearFeedback={clearLaunchChallengeFeedback}
              onLaunchChallenge={launchChallenge}
              onRefresh={refresh}
              onSelectMatch={selectMatch}
              selectedMatchId={selectedMatchId}
            />
          ) : null}
        </section>

        {isAdmin ? (
          <section
            className="captain-page__panel captain-page__panel--result"
            aria-labelledby="captain-page-result-title"
          >
            {isInitialLoading ? (
              <section
                className="captain-page__state-panel"
                aria-label="Preparando registro do resultado"
              >
                <Spinner
                  label="Preparando o registro do resultado do desafio..."
                  size="lg"
                />
              </section>
            ) : null}

            {!isInitialLoading && showFullError ? (
              <section
                className="captain-page__state-panel"
                aria-label="Registro do resultado indisponivel"
              >
                <Alert title="Registro indisponivel" variant="warning">
                  Carregue o status do ciclo com sucesso para registrar o
                  resultado do desafio.
                </Alert>
              </section>
            ) : null}

            {!isInitialLoading && !showFullError ? (
              <ChallengeResultSection
                captainStatus={captainStatus}
                isSubmitting={isRegisteringResult}
                onClearFeedback={clearResultFeedback}
                onRegisterResult={registerChallengeResult}
                resultError={resultError}
                resultNotice={resultNotice}
              />
            ) : null}
          </section>
        ) : null}
      </div>
    </section>
  )
}
