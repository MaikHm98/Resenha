import { Link, useParams } from 'react-router-dom'
import {
  ROUTE_PATHS,
  buildMatchDetailPath,
  buildMatchVotePath,
} from '../../../app/router/paths'
import { Alert, Button, EmptyState, Spinner } from '../../../shared/components'
import { ApproveVoteSection } from '../components/ApproveVoteSection'
import { CastVoteSection } from '../components/CastVoteSection'
import { CloseVoteSection } from '../components/CloseVoteSection'
import { OpenVotingSection } from '../components/OpenVotingSection'
import { VoteHistoryPanel } from '../components/VoteHistoryPanel'
import { VoteStatusPanel } from '../components/VoteStatusPanel'
import { useMatchVoteData } from '../hooks/useMatchVoteData'
import './MatchVotePage.css'

function parseMatchId(value: string | undefined): number | null {
  if (!value) {
    return null
  }

  const parsedValue = Number.parseInt(value, 10)
  return Number.isNaN(parsedValue) ? null : parsedValue
}

export function MatchVotePage() {
  const { matchId } = useParams<{ matchId: string }>()
  const currentMatchId = matchId ?? 'sem-id'
  const parsedMatchId = parseMatchId(matchId)
  const {
    voteStatus,
    canManageVoting,
    managementCapabilityIssue,
    hasVotingStarted,
    status,
    error,
    voteError,
    voteNotice,
    closeVoteError,
    closeVoteNotice,
    approveVoteError,
    approveVoteNotice,
    openVotingError,
    openVotingNotice,
    activeVoteType,
    activeVoteCandidateUserId,
    activeCloseVoteType,
    activeApproveVoteType,
    isLoading,
    isRefreshing,
    isCastingVote,
    isClosingVote,
    isApprovingVote,
    isOpeningVoting,
    refresh,
    castVote,
    closeVote,
    approveVote,
    openVoting,
    clearError,
    clearVoteFeedback,
    clearCloseVoteFeedback,
    clearApproveVoteFeedback,
    clearOpenVotingFeedback,
  } = useMatchVoteData(parsedMatchId)

  const isInitialLoading = status === 'idle' || status === 'loading' || isLoading
  const showFullError = status === 'error' && !voteStatus

  return (
    <section className="match-vote-page" aria-labelledby="match-vote-page-title">
      <header className="match-vote-page__hero">
        <div className="match-vote-page__breadcrumbs">
          <Link to={ROUTE_PATHS.GROUPS}>Grupos</Link>
          <span>/</span>
          <Link to={buildMatchDetailPath(currentMatchId)}>{currentMatchId}</Link>
          <span>/</span>
          <span>vote</span>
        </div>

        <div className="match-vote-page__hero-content">
          <div>
            <p className="match-vote-page__route">
              Rota ativa: {buildMatchVotePath(currentMatchId)}
            </p>
            <h1 className="app-title" id="match-vote-page-title">
              Votacao da partida
            </h1>
            <p className="app-subtitle">
              Esta pagina-base separa o fluxo de votacao do detalhe da partida e
              prepara o modulo `matches` para refletir o snapshot atual da
              votacao e a abertura conjunta dos dois tipos via backend.
            </p>
          </div>

          <div className="match-vote-page__hero-actions">
            <Link
              className="match-vote-page__link match-vote-page__link--primary"
              to={buildMatchDetailPath(currentMatchId)}
            >
              Voltar para a partida
            </Link>
            <Link className="match-vote-page__link" to={ROUTE_PATHS.GROUPS}>
              Voltar para grupos
            </Link>
            <Button
              disabled={parsedMatchId === null || isInitialLoading}
              loading={isRefreshing}
              onClick={() => void refresh()}
              type="button"
              variant="secondary"
            >
              Atualizar votacao
            </Button>
          </div>
        </div>
      </header>

      {error && !showFullError ? (
        <div className="match-vote-page__alert-stack">
          <Alert title="Nao foi possivel concluir a atualizacao" variant="warning">
            {error}
          </Alert>
          <div className="match-vote-page__alert-actions">
            <Button onClick={clearError} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      {managementCapabilityIssue && !showFullError ? (
        <div className="match-vote-page__alert-stack">
          <Alert title="Permissao admin temporariamente indisponivel" variant="warning">
            {managementCapabilityIssue}
          </Alert>
        </div>
      ) : null}

      {isInitialLoading ? (
        <section
          className="match-vote-page__state-panel"
          aria-label="Carregando status da votacao"
        >
          <Spinner label="Carregando status da votacao..." size="lg" />
        </section>
      ) : null}

      {!isInitialLoading && showFullError ? (
        <section
          className="match-vote-page__state-panel"
          aria-label="Erro ao carregar votacao"
        >
          <Alert title="Nao foi possivel carregar esta votacao" variant="error">
            {error ?? 'Tente novamente em alguns instantes.'}
          </Alert>
          <div className="match-vote-page__state-actions">
            <Button onClick={() => void refresh()} type="button">
              Tentar novamente
            </Button>
            <Link
              className="match-vote-page__link"
              to={buildMatchDetailPath(currentMatchId)}
            >
              Voltar para a partida
            </Link>
          </div>
        </section>
      ) : null}

      {!isInitialLoading && !showFullError && !voteStatus ? (
        <section
          className="match-vote-page__state-panel"
          aria-label="Status da votacao indisponivel"
        >
          <EmptyState
            action={
              <Link
                className="match-vote-page__link match-vote-page__link--primary"
                to={buildMatchDetailPath(currentMatchId)}
              >
                Voltar para a partida
              </Link>
            }
            description="Se esta votacao existir, tente atualizar a tela novamente em alguns instantes."
            title="Status da votacao indisponivel"
          />
        </section>
      ) : null}

      {!isInitialLoading && !showFullError && voteStatus ? (
        <div className="match-vote-page__content">
          <section
            className="match-vote-page__panel match-vote-page__panel--wide"
            aria-labelledby="match-vote-status-title"
          >
            <header className="match-vote-page__panel-header">
              <div>
                <h2 id="match-vote-status-title">Estado atual da votacao</h2>
                <p>
                  O snapshot atual mostra `MVP` e `BOLA_MURCHA` separadamente,
                  respeitando rodada, status, candidatos, contagem e vencedor
                  provisorio exatamente como vieram do backend.
                </p>
              </div>
              <span className="match-vote-page__badge">Leitura</span>
            </header>

            <VoteStatusPanel voteStatus={voteStatus} />
          </section>

          <section
            className="match-vote-page__panel"
            aria-labelledby="match-vote-actions-title"
          >
            <header className="match-vote-page__panel-header">
              <div>
                <h2 id="match-vote-actions-title">Abertura da votacao</h2>
                <p>
                  Nesta etapa, o admin pode abrir a votacao conjunta. Voto,
                  encerramento e aprovacao final entram nos proximos commits.
                </p>
              </div>
              <span className="match-vote-page__badge match-vote-page__badge--outline">
                Operacao
              </span>
            </header>

            <OpenVotingSection
              adminCapabilityIssue={managementCapabilityIssue}
              canManageVoting={canManageVoting}
              hasVotingStarted={hasVotingStarted}
              isOpeningVoting={isOpeningVoting}
              onClearFeedback={clearOpenVotingFeedback}
              onOpenVoting={openVoting}
              openVotingError={openVotingError}
              openVotingNotice={openVotingNotice}
            />
          </section>

          <section
            className="match-vote-page__panel"
            aria-labelledby="match-vote-cast-title"
          >
            <header className="match-vote-page__panel-header">
              <div>
                <h2 id="match-vote-cast-title">Registrar voto da rodada</h2>
                <p>
                  O voto usa apenas o payload real do backend. Auto-voto,
                  elegibilidade, voto duplicado e estado da rodada continuam
                  sendo decididos na API.
                </p>
              </div>
              <span className="match-vote-page__badge match-vote-page__badge--outline">
                Voto
              </span>
            </header>

            <CastVoteSection
              activeVoteCandidateUserId={activeVoteCandidateUserId}
              activeVoteType={activeVoteType}
              bolaMurchaRound={voteStatus.bolaMurcha}
              isCastingVote={isCastingVote}
              mvpRound={voteStatus.mvp}
              onClearFeedback={clearVoteFeedback}
              onVote={castVote}
              voteError={voteError}
              voteNotice={voteNotice}
            />
          </section>

          <section
            className="match-vote-page__panel"
            aria-labelledby="match-vote-close-title"
          >
            <header className="match-vote-page__panel-header">
              <div>
                <h2 id="match-vote-close-title">Encerramento e apuracao</h2>
                <p>
                  O admin pode solicitar o encerramento da rodada atual. Empate,
                  nova rodada e apuracao continuam sendo decididos apenas pelo
                  backend.
                </p>
              </div>
              <span className="match-vote-page__badge match-vote-page__badge--outline">
                Admin
              </span>
            </header>

            <CloseVoteSection
              activeCloseVoteType={activeCloseVoteType}
              adminCapabilityIssue={managementCapabilityIssue}
              bolaMurchaRound={voteStatus.bolaMurcha}
              canManageVoting={canManageVoting}
              closeVoteError={closeVoteError}
              closeVoteNotice={closeVoteNotice}
              isClosingVote={isClosingVote}
              mvpRound={voteStatus.mvp}
              onClearFeedback={clearCloseVoteFeedback}
              onCloseVote={closeVote}
            />
          </section>

          <section
            className="match-vote-page__panel"
            aria-labelledby="match-vote-approve-title"
          >
            <header className="match-vote-page__panel-header">
              <div>
                <h2 id="match-vote-approve-title">Aprovacao final</h2>
                <p>
                  O admin pode confirmar o fechamento definitivo da votacao
                  quando o snapshot do backend chegar ao ponto correto de
                  aprovacao.
                </p>
              </div>
              <span className="match-vote-page__badge match-vote-page__badge--outline">
                Admin
              </span>
            </header>

            <ApproveVoteSection
              activeApproveVoteType={activeApproveVoteType}
              adminCapabilityIssue={managementCapabilityIssue}
              approveVoteError={approveVoteError}
              approveVoteNotice={approveVoteNotice}
              bolaMurchaRound={voteStatus.bolaMurcha}
              canManageVoting={canManageVoting}
              isApprovingVote={isApprovingVote}
              mvpRound={voteStatus.mvp}
              onApproveVote={approveVote}
              onClearFeedback={clearApproveVoteFeedback}
            />
          </section>

          <section
            className="match-vote-page__panel"
            aria-labelledby="match-vote-history-title"
          >
            <header className="match-vote-page__panel-header">
              <div>
                <h2 id="match-vote-history-title">Historico das rodadas</h2>
                <p>
                  Cada tipo continua separado e o historico vem exatamente do
                  snapshot atual, sem reconstrucao local de empate, rodada ou
                  vencedor.
                </p>
              </div>
              <span className="match-vote-page__badge match-vote-page__badge--outline">
                Leitura
              </span>
            </header>

            <VoteHistoryPanel voteStatus={voteStatus} />
          </section>

          <section
            className="match-vote-page__panel match-vote-page__panel--wide"
            aria-labelledby="match-vote-safety-title"
          >
            <header className="match-vote-page__panel-header">
              <div>
                <h2 id="match-vote-safety-title">Fonte de verdade e seguranca</h2>
                <p>
                  O frontend web so reflete o snapshot real do backend para
                  `MVP` e `BOLA_MURCHA`, sem inferir rodada, vencedor ou estado
                  fora do que a API devolver.
                </p>
              </div>
              <span className="match-vote-page__badge match-vote-page__badge--danger">
                Sensivel
              </span>
            </header>

            <div className="match-vote-page__highlight-grid">
              <article className="match-vote-page__card">
                <p className="match-vote-page__label">Tipos preservados</p>
                <strong className="match-vote-page__name">MVP e Bola Murcha</strong>
                <p className="match-vote-page__meta">
                  A abertura continua conjunta e o snapshot fica separado por tipo.
                </p>
              </article>

              <article className="match-vote-page__card">
                <p className="match-vote-page__label">Status preservados</p>
                <strong className="match-vote-page__name">
                  Aberta, encerrada, apurada e aprovada
                </strong>
                <p className="match-vote-page__meta">
                  Sem reconstruir rodada, vencedor ou historico localmente.
                </p>
              </article>

              <article className="match-vote-page__card">
                <p className="match-vote-page__label">Escopo</p>
                <strong className="match-vote-page__name">
                  Fluxo ancorado em `matches`
                </strong>
                <p className="match-vote-page__meta">
                  Match valido: {parsedMatchId !== null ? 'sim' : 'nao'}.
                </p>
              </article>

              <article className="match-vote-page__card">
                <p className="match-vote-page__label">Separacao</p>
                <strong className="match-vote-page__name">
                  Votacao fora do detalhe basico
                </strong>
                <p className="match-vote-page__meta">
                  O detalhe continua sendo ponto de entrada, mas a votacao fica em
                  uma rota dedicada.
                </p>
              </article>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  )
}
