import { Alert, Button, EmptyState, Spinner } from '../../../shared/components'
import type { Match } from '../../matches/types/matchesContracts'
import { CaptainMatchSelector } from './CaptainMatchSelector'
import { EligibleChallengersList } from './EligibleChallengersList'
import type {
  CaptainPlayerSummary,
  CaptainStatus,
} from '../types/captainContracts'

type LaunchChallengeSectionProps = {
  captainStatus: CaptainStatus | null
  hasNoCycle: boolean
  isCurrentCaptain: boolean
  groupMatches: Match[]
  selectedMatchId: number | null
  eligibleChallengers: CaptainPlayerSummary[]
  matchesError: string | null
  eligibleError: string | null
  launchChallengeError: string | null
  launchChallengeNotice: string | null
  isLoadingMatches: boolean
  isLoadingEligibleChallengers: boolean
  isLaunchingChallenge: boolean
  onRefresh: () => Promise<void>
  onSelectMatch: (matchId: number | null) => void
  onLaunchChallenge: (challengerUserId: number) => Promise<boolean>
  onClearFeedback: () => void
}

export function LaunchChallengeSection({
  captainStatus,
  hasNoCycle,
  isCurrentCaptain,
  groupMatches,
  selectedMatchId,
  eligibleChallengers,
  matchesError,
  eligibleError,
  launchChallengeError,
  launchChallengeNotice,
  isLoadingMatches,
  isLoadingEligibleChallengers,
  isLaunchingChallenge,
  onRefresh,
  onSelectMatch,
  onLaunchChallenge,
  onClearFeedback,
}: LaunchChallengeSectionProps) {
  const hasPendingChallenge =
    captainStatus?.idDesafiante !== null && captainStatus?.nomeDesafiante !== null

  return (
    <div className="launch-challenge-section">
      <header className="captain-page__panel-header">
        <div>
          <h2 id="captain-page-launch-title">Escolher desafiante</h2>
          <p>
            O frontend usa a partida apenas como contexto e deixa o backend
            decidir quem realmente e elegivel para o desafio.
          </p>
        </div>
        <span className="captain-page__badge captain-page__badge--outline">
          Proximo passo
        </span>
      </header>

      {launchChallengeNotice || launchChallengeError ? (
        <div className="captain-page__alert-stack">
          {launchChallengeNotice ? (
            <Alert title="Desafio atualizado" variant="success">
              {launchChallengeNotice}
            </Alert>
          ) : null}
          {launchChallengeError ? (
            <Alert title="Nao foi possivel escolher o desafiante" variant="error">
              {launchChallengeError}
            </Alert>
          ) : null}
          <div className="captain-page__alert-actions">
            <Button onClick={onClearFeedback} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      {hasNoCycle || captainStatus === null ? (
        <EmptyState
          title="Fluxo de desafio ainda indisponivel"
          description="Abra ou carregue um ciclo de capitao para selecionar a partida e consultar os elegiveis."
        />
      ) : null}

      {captainStatus !== null && hasPendingChallenge ? (
        <Alert title="Ja existe um desafio pendente" variant="info">
          {captainStatus.nomeDesafiante} ja foi escolhido como desafiante deste
          ciclo. O proximo passo e registrar o resultado do duelo.
        </Alert>
      ) : null}

      {captainStatus !== null && !hasPendingChallenge && !isCurrentCaptain ? (
        <Alert title="Fluxo restrito ao capitao atual" variant="info">
          Apenas o capitao atual pode escolher o desafiante desta rodada.
        </Alert>
      ) : null}

      {captainStatus !== null && !hasPendingChallenge && isCurrentCaptain ? (
        <div className="launch-challenge-section__content">
          {isLoadingMatches ? (
            <section
              className="captain-page__state-panel"
              aria-label="Carregando partidas do grupo"
            >
              <Spinner label="Carregando partidas do grupo..." size="lg" />
            </section>
          ) : null}

          {!isLoadingMatches && matchesError ? (
            <section
              className="captain-page__state-panel"
              aria-label="Erro ao carregar partidas do grupo"
            >
              <Alert
                title="Nao foi possivel carregar as partidas do grupo"
                variant="error"
              >
                {matchesError}
              </Alert>
              <Button onClick={() => void onRefresh()} type="button">
                Tentar novamente
              </Button>
            </section>
          ) : null}

          {!isLoadingMatches && !matchesError ? (
            <>
              {groupMatches.length > 0 ? (
                <CaptainMatchSelector
                  matches={groupMatches}
                  onSelectMatch={onSelectMatch}
                  selectedMatchId={selectedMatchId}
                />
              ) : (
                <EmptyState
                  title="Nenhuma partida disponivel"
                  description="Crie ou abra uma partida do grupo para usar como contexto do desafio."
                />
              )}

              {groupMatches.length > 0 && selectedMatchId === null ? (
                <Alert title="Selecione uma partida" variant="info">
                  Escolha uma partida do grupo para consultar os elegiveis
                  devolvidos pelo backend.
                </Alert>
              ) : null}

              {groupMatches.length > 0 &&
              selectedMatchId !== null &&
              isLoadingEligibleChallengers ? (
                <section
                  className="captain-page__state-panel"
                  aria-label="Carregando elegiveis"
                >
                  <Spinner
                    label="Carregando jogadores elegiveis desta partida..."
                    size="lg"
                  />
                </section>
              ) : null}

              {groupMatches.length > 0 &&
              selectedMatchId !== null &&
              !isLoadingEligibleChallengers &&
              eligibleError ? (
                <Alert
                  title="Nao foi possivel carregar os elegiveis"
                  variant="error"
                >
                  {eligibleError}
                </Alert>
              ) : null}

              {groupMatches.length > 0 &&
              selectedMatchId !== null &&
              !isLoadingEligibleChallengers &&
              !eligibleError ? (
                <>
                  {eligibleChallengers.length > 0 ? (
                    <EligibleChallengersList
                      eligibleChallengers={eligibleChallengers}
                      isSubmitting={isLaunchingChallenge}
                      onLaunchChallenge={onLaunchChallenge}
                    />
                  ) : (
                    <EmptyState
                      title="Nenhum elegivel devolvido"
                      description="O backend nao retornou jogadores elegiveis para a partida selecionada."
                    />
                  )}
                </>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
