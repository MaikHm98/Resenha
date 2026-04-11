import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ROUTE_PATHS,
  buildGroupMatchesPath,
  buildMatchChallengePath,
  buildMatchDetailPath,
  buildMatchVotePath,
} from '../../../app/router/paths'
import { Alert, Button, EmptyState, Spinner } from '../../../shared/components'
import { AddGuestForm } from '../components/AddGuestForm'
import { MatchAttendancePanel } from '../components/MatchAttendancePanel'
import { MatchActionsPanel } from '../components/MatchActionsPanel'
import { DeleteMatchSection } from '../components/DeleteMatchSection'
import { MatchOverviewPanel } from '../components/MatchOverviewPanel'
import { useMatchDetailData } from '../hooks/useMatchDetailData'
import './MatchDetailPage.css'

function parseMatchId(value: string | undefined): number | null {
  if (!value) {
    return null
  }

  const parsedValue = Number.parseInt(value, 10)
  return Number.isNaN(parsedValue) ? null : parsedValue
}

export function MatchDetailPage() {
  const navigate = useNavigate()
  const { matchId } = useParams<{ matchId: string }>()
  const currentMatchId = matchId ?? 'sem-id'
  const parsedMatchId = parseMatchId(matchId)
  const {
    match,
    userAttendanceStatus,
    attendanceStatusIssue,
    canManageMatch,
    managementCapabilityIssue,
    status,
    error,
    actionError,
    actionNotice,
    activeAction,
    guestError,
    guestNotice,
    deleteMatchError,
    isLoading,
    isRefreshing,
    isSubmittingAction,
    isAddingGuest,
    isDeletingMatch,
    refresh,
    confirmPresence,
    cancelPresence,
    markAbsent,
    cancelAbsent,
    addGuest,
    deleteMatch,
    clearError,
    clearActionFeedback,
    clearGuestFeedback,
    clearDeleteMatchFeedback,
  } = useMatchDetailData(parsedMatchId)

  const isInitialLoading = status === 'idle' || status === 'loading' || isLoading
  const showFullError = status === 'error' && !match
  const backPath = match ? buildGroupMatchesPath(match.idGrupo) : ROUTE_PATHS.GROUPS
  const backLabel = match ? 'Voltar para partidas do grupo' : 'Voltar para grupos'

  return (
    <section className="match-detail-page" aria-labelledby="match-detail-page-title">
      <header className="match-detail-page__hero">
        <div className="match-detail-page__breadcrumbs">
          <Link to={ROUTE_PATHS.GROUPS}>Grupos</Link>
          {match ? (
            <>
              <span>/</span>
              <Link to={buildGroupMatchesPath(match.idGrupo)}>
                grupo {match.idGrupo}
              </Link>
            </>
          ) : null}
          <span>/</span>
          <span>{currentMatchId}</span>
        </div>

        <div className="match-detail-page__hero-content">
          <div>
            <p className="match-detail-page__route">
              Rota ativa: {buildMatchDetailPath(currentMatchId)}
            </p>
            <h1 className="app-title" id="match-detail-page-title">
              {match ? `Partida #${match.idPartida}` : 'Detalhe da partida'}
            </h1>
            <p className="app-subtitle">
              Leitura operacional da partida, pronta para receber as acoes do
              jogador e do admin nos proximos commits.
            </p>
          </div>

          <div className="match-detail-page__hero-actions">
            <Link
              className="match-detail-page__link match-detail-page__link--primary"
              to={backPath}
            >
              {backLabel}
            </Link>
            <Link className="match-detail-page__link" to={buildMatchChallengePath(currentMatchId)}>
              Abrir desafio
            </Link>
            <Link className="match-detail-page__link" to={buildMatchVotePath(currentMatchId)}>
              Abrir votacao
            </Link>
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
      </header>

      {error && !showFullError ? (
        <div className="match-detail-page__alert-stack">
          <Alert title="Nao foi possivel concluir a atualizacao" variant="warning">
            {error}
          </Alert>
          <div className="match-detail-page__alert-actions">
            <Button onClick={clearError} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      {isInitialLoading ? (
        <section
          className="match-detail-page__state-panel"
          aria-label="Carregando detalhe da partida"
        >
          <Spinner label="Carregando detalhe da partida..." size="lg" />
        </section>
      ) : null}

      {!isInitialLoading && showFullError ? (
        <section
          className="match-detail-page__state-panel"
          aria-label="Erro ao carregar detalhe da partida"
        >
          <Alert title="Nao foi possivel carregar esta partida" variant="error">
            {error ?? 'Tente novamente em alguns instantes.'}
          </Alert>
          <div className="match-detail-page__state-actions">
            <Button onClick={() => void refresh()} type="button">
              Tentar novamente
            </Button>
            <Link className="match-detail-page__link" to={ROUTE_PATHS.GROUPS}>
              Voltar para grupos
            </Link>
          </div>
        </section>
      ) : null}

      {!isInitialLoading && !showFullError && !match ? (
        <section
          className="match-detail-page__state-panel"
          aria-label="Detalhe indisponivel"
        >
          <EmptyState
            action={
              <Link
                className="match-detail-page__link match-detail-page__link--primary"
                to={ROUTE_PATHS.GROUPS}
              >
                Voltar para grupos
              </Link>
            }
            description="Se esta partida existir, tente atualizar a tela novamente em alguns instantes."
            title="Detalhe da partida indisponivel"
          />
        </section>
      ) : null}

      {!isInitialLoading && !showFullError && match ? (
        <div className="match-detail-page__content">
          <section
            className="match-detail-page__panel match-detail-page__panel--overview"
            aria-labelledby="match-detail-overview-title"
          >
            <header className="match-detail-page__panel-header">
              <div>
                <h2 id="match-detail-overview-title">Overview da partida</h2>
                <p>
                  Subconjunto operacional da fase: data/hora, status, observacao,
                  limite e total de confirmados.
                </p>
              </div>
              <span className="match-detail-page__badge">Leitura</span>
            </header>

            <MatchOverviewPanel match={match} />
          </section>

          <section
            className="match-detail-page__panel match-detail-page__panel--actions"
            aria-labelledby="match-detail-actions-title"
          >
            <header className="match-detail-page__panel-header">
              <div>
                <h2 id="match-detail-actions-title">Sua operacao na partida</h2>
                <p>
                  Confirmacao, cancelamento e ausencia continuam totalmente
                  ancorados nas validacoes do backend.
                </p>
              </div>
              <span className="match-detail-page__badge match-detail-page__badge--outline">
                Jogador
              </span>
            </header>

            <MatchActionsPanel
              availabilityWarning={attendanceStatusIssue}
              actionError={actionError}
              actionNotice={actionNotice}
              activeAction={activeAction}
              isSubmittingAction={isSubmittingAction}
              onCancelAbsent={cancelAbsent}
              onCancelPresence={cancelPresence}
              onClearFeedback={clearActionFeedback}
              onConfirmPresence={confirmPresence}
              onMarkAbsent={markAbsent}
              userAttendanceStatus={userAttendanceStatus}
            />
          </section>

          {canManageMatch || managementCapabilityIssue ? (
            <section
              className="match-detail-page__panel match-detail-page__panel--admin"
              aria-labelledby="match-detail-admin-title"
            >
              <header className="match-detail-page__panel-header">
                <div>
                  <h2 id="match-detail-admin-title">Operacao do admin</h2>
                  <p>
                    Convidado e exclusao continuam restritos ao admin e sempre
                    dependem do retorno real do backend.
                  </p>
                </div>
                <span className="match-detail-page__badge match-detail-page__badge--danger">
                  Somente admin
                </span>
              </header>

              {canManageMatch ? (
                <div className="match-detail-page__admin-stack">
                  <div className="match-detail-page__admin-box">
                    <div className="match-detail-page__admin-box-header">
                      <h3>Adicionar convidado</h3>
                      <p>
                        O backend decide se a partida aceita convidados neste
                        momento e atualiza o detalhe apos sucesso.
                      </p>
                    </div>

                    <AddGuestForm
                      guestError={guestError}
                      guestNotice={guestNotice}
                      isSubmitting={isAddingGuest}
                      onClearFeedback={clearGuestFeedback}
                      onSubmit={addGuest}
                    />
                  </div>

                  <div className="match-detail-page__admin-box match-detail-page__admin-box--danger">
                    <div className="match-detail-page__admin-box-header">
                      <h3>Excluir partida</h3>
                      <p>
                        A exclusao retorna com seguranca para a listagem do grupo e
                        preserva o backend como fonte de verdade das regras.
                      </p>
                    </div>

                    <DeleteMatchSection
                      error={deleteMatchError}
                      isSubmitting={isDeletingMatch}
                      matchId={match.idPartida}
                      onClearFeedback={clearDeleteMatchFeedback}
                      onConfirmDelete={async () => {
                        const didDelete = await deleteMatch()

                        if (didDelete) {
                          navigate(buildGroupMatchesPath(match.idGrupo), {
                            replace: true,
                          })
                        }

                        return didDelete
                      }}
                    />
                  </div>
                </div>
              ) : (
                <Alert title="Acoes administrativas indisponiveis agora" variant="warning">
                  {managementCapabilityIssue}
                </Alert>
              )}
            </section>
          ) : null}

          <section
            className="match-detail-page__panel match-detail-page__panel--attendance"
            aria-labelledby="match-detail-attendance-title"
          >
            <header className="match-detail-page__panel-header">
              <div>
                <h2 id="match-detail-attendance-title">Participacao da partida</h2>
                <p>
                  Confirmados, ausentes e quem ainda nao respondeu, sem expor
                  blocos de capitao, times, premio ou historico nesta fase.
                </p>
              </div>
              <span className="match-detail-page__badge match-detail-page__badge--outline">
                {match.totalConfirmados}/{match.limiteVagas}
              </span>
            </header>

            <MatchAttendancePanel match={match} />
          </section>
        </div>
      ) : null}
    </section>
  )
}

