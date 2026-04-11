import { Alert, Button } from '../../../shared/components'
import type {
  MatchPlayerActionKind,
  MatchUserAttendanceStatus,
} from '../hooks/useMatchDetailData'

type MatchActionsPanelProps = {
  userAttendanceStatus: MatchUserAttendanceStatus | null
  availabilityWarning: string | null
  actionError: string | null
  actionNotice: string | null
  activeAction: MatchPlayerActionKind | null
  isSubmittingAction: boolean
  onConfirmPresence: () => Promise<boolean>
  onCancelPresence: () => Promise<boolean>
  onMarkAbsent: () => Promise<boolean>
  onCancelAbsent: () => Promise<boolean>
  onClearFeedback: () => void
}

function getAttendanceStatusLabel(
  userAttendanceStatus: MatchUserAttendanceStatus | null,
): string {
  if (userAttendanceStatus === 'CONFIRMADO') {
    return 'Confirmado'
  }

  if (userAttendanceStatus === 'AUSENTE') {
    return 'Ausente'
  }

  if (userAttendanceStatus === 'NEUTRO') {
    return 'Sem resposta'
  }

  return 'Indisponivel'
}

function getAttendanceStatusClassName(
  userAttendanceStatus: MatchUserAttendanceStatus | null,
): string {
  if (userAttendanceStatus === 'CONFIRMADO') {
    return 'match-actions-panel__status--confirmed'
  }

  if (userAttendanceStatus === 'AUSENTE') {
    return 'match-actions-panel__status--absent'
  }

  if (userAttendanceStatus === 'NEUTRO') {
    return 'match-actions-panel__status--neutral'
  }

  return 'match-actions-panel__status--unknown'
}

export function MatchActionsPanel({
  userAttendanceStatus,
  availabilityWarning,
  actionError,
  actionNotice,
  activeAction,
  isSubmittingAction,
  onConfirmPresence,
  onCancelPresence,
  onMarkAbsent,
  onCancelAbsent,
  onClearFeedback,
}: MatchActionsPanelProps) {
  const isPresenceConfirmed = userAttendanceStatus === 'CONFIRMADO'
  const isAbsentMarked = userAttendanceStatus === 'AUSENTE'
  const isStateReady = userAttendanceStatus !== null
  const presenceButtonLabel = isPresenceConfirmed
    ? 'Cancelar presenca'
    : 'Confirmar presenca'
  const absenceButtonLabel = isAbsentMarked
    ? 'Remover ausencia'
    : 'Marcar ausencia'

  return (
    <div className="match-actions-panel">
      <div className="match-actions-panel__header">
        <div>
          <h3 className="match-actions-panel__title">Sua resposta nesta partida</h3>
          <p className="match-actions-panel__description">
            O backend continua validando janela, vagas, goleiro e demais
            restricoes da operacao.
          </p>
        </div>

        <span
          className={[
            'match-actions-panel__status',
            getAttendanceStatusClassName(userAttendanceStatus),
          ].join(' ')}
        >
          {getAttendanceStatusLabel(userAttendanceStatus)}
        </span>
      </div>

      {actionNotice ? (
        <div className="match-actions-panel__feedback">
          <Alert title="Acao concluida" variant="success">
            {actionNotice}
          </Alert>
          <div className="match-actions-panel__feedback-actions">
            <Button onClick={onClearFeedback} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      {actionError ? (
        <div className="match-actions-panel__feedback">
          <Alert title="Nao foi possivel atualizar sua resposta" variant="warning">
            {actionError}
          </Alert>
          <div className="match-actions-panel__feedback-actions">
            <Button onClick={onClearFeedback} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      {!isStateReady ? (
        <Alert title="Acoes do jogador indisponiveis agora" variant="warning">
          {availabilityWarning ??
            'Nao foi possivel determinar seu estado atual nesta partida. Atualize o detalhe para tentar novamente.'}
        </Alert>
      ) : (
        <div className="match-actions-panel__grid">
          <section className="match-actions-panel__card">
            <div className="match-actions-panel__card-copy">
              <h4>Presenca</h4>
              <p>
                Confirme sua vaga ou remova sua confirmacao, sempre validando o
                retorno real do backend.
              </p>
            </div>

            <Button
              fullWidth
              loading={
                isSubmittingAction &&
                (activeAction === 'confirmPresence' ||
                  activeAction === 'cancelPresence')
              }
              onClick={() =>
                void (isPresenceConfirmed
                  ? onCancelPresence()
                  : onConfirmPresence())
              }
              type="button"
            >
              {presenceButtonLabel}
            </Button>
          </section>

          <section className="match-actions-panel__card">
            <div className="match-actions-panel__card-copy">
              <h4>Ausencia</h4>
              <p>
                Marque que nao vai ou remova a ausencia explicita, sem criar
                regra local sobre o que e permitido.
              </p>
            </div>

            <Button
              fullWidth
              loading={
                isSubmittingAction &&
                (activeAction === 'markAbsent' ||
                  activeAction === 'cancelAbsent')
              }
              onClick={() =>
                void (isAbsentMarked ? onCancelAbsent() : onMarkAbsent())
              }
              type="button"
              variant="secondary"
            >
              {absenceButtonLabel}
            </Button>
          </section>
        </div>
      )}
    </div>
  )
}
