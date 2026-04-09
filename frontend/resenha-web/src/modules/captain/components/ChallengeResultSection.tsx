import { Alert, Button, EmptyState } from '../../../shared/components'
import type {
  CaptainChallengeResult,
  CaptainStatus,
} from '../types/captainContracts'

type ChallengeResultSectionProps = {
  captainStatus: CaptainStatus | null
  isSubmitting: boolean
  resultError: string | null
  resultNotice: string | null
  onRegisterResult: (resultado: CaptainChallengeResult) => Promise<boolean>
  onClearFeedback: () => void
}

export function ChallengeResultSection({
  captainStatus,
  isSubmitting,
  resultError,
  resultNotice,
  onRegisterResult,
  onClearFeedback,
}: ChallengeResultSectionProps) {
  const hasPendingChallenge =
    captainStatus?.idDesafiante !== null && captainStatus?.nomeDesafiante !== null

  return (
    <div className="challenge-result-section">
      <header className="captain-page__panel-header">
        <div>
          <h2 id="captain-page-result-title">Registrar resultado</h2>
          <p>
            O admin registra o desfecho do duelo e o backend decide a transicao
            completa do ciclo.
          </p>
        </div>
        <span className="captain-page__badge captain-page__badge--outline">
          Admin
        </span>
      </header>

      {resultNotice || resultError ? (
        <div className="captain-page__alert-stack">
          {resultNotice ? (
            <Alert title="Resultado atualizado" variant="success">
              {resultNotice}
            </Alert>
          ) : null}
          {resultError ? (
            <Alert title="Nao foi possivel registrar o resultado" variant="error">
              {resultError}
            </Alert>
          ) : null}
          <div className="captain-page__alert-actions">
            <Button onClick={onClearFeedback} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      {captainStatus === null || !hasPendingChallenge ? (
        <EmptyState
          title="Nenhum desafio pendente"
          description="Quando houver um desafiante definido, o admin podera registrar se venceu o CAPITAO ou o DESAFIANTE."
        />
      ) : null}

      {captainStatus !== null && hasPendingChallenge ? (
        <div className="challenge-result-section__content">
          <div className="challenge-result-section__summary">
            <p className="challenge-result-section__label">Duelo pendente</p>
            <strong className="challenge-result-section__title">
              {captainStatus.nomeCapitao} x {captainStatus.nomeDesafiante}
            </strong>
            <p className="challenge-result-section__hint">
              Valores aceitos pelo backend: `CAPITAO` ou `DESAFIANTE`.
            </p>
          </div>

          <div className="challenge-result-section__actions">
            <Button
              loading={isSubmitting}
              onClick={() => void onRegisterResult('CAPITAO')}
              type="button"
            >
              Registrar CAPITAO
            </Button>
            <Button
              loading={isSubmitting}
              onClick={() => void onRegisterResult('DESAFIANTE')}
              type="button"
              variant="danger"
            >
              Registrar DESAFIANTE
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
