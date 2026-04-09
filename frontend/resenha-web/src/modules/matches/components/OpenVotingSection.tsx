import { Alert, Button } from '../../../shared/components'

type OpenVotingSectionProps = {
  canManageVoting: boolean
  hasVotingStarted: boolean
  openVotingError: string | null
  openVotingNotice: string | null
  isOpeningVoting: boolean
  onOpenVoting: () => Promise<boolean>
  onClearFeedback: () => void
}

export function OpenVotingSection({
  canManageVoting,
  hasVotingStarted,
  openVotingError,
  openVotingNotice,
  isOpeningVoting,
  onOpenVoting,
  onClearFeedback,
}: OpenVotingSectionProps) {
  return (
    <div className="open-voting-section">
      {openVotingError ? (
        <div className="open-voting-section__feedback">
          <Alert title="Nao foi possivel abrir a votacao" variant="warning">
            {openVotingError}
          </Alert>
          <div className="open-voting-section__feedback-actions">
            <Button onClick={onClearFeedback} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      {openVotingNotice ? (
        <div className="open-voting-section__feedback">
          <Alert title="Votacao aberta" variant="success">
            {openVotingNotice}
          </Alert>
          <div className="open-voting-section__feedback-actions">
            <Button onClick={onClearFeedback} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      {!canManageVoting ? (
        <div className="open-voting-section__notice">
          <h3>Abertura restrita ao admin</h3>
          <p>
            O backend continua sendo a fonte de verdade da abertura conjunta de
            `MVP` e `BOLA_MURCHA`. Esta acao fica disponivel apenas para admin.
          </p>
        </div>
      ) : null}

      {canManageVoting && hasVotingStarted ? (
        <div className="open-voting-section__notice">
          <h3>Votacao ja iniciada</h3>
          <p>
            O snapshot atual ja devolve rodada para pelo menos um dos tipos de
            votacao. A abertura conjunta nao deve ser refeita pelo frontend.
          </p>
        </div>
      ) : null}

      {canManageVoting && !hasVotingStarted ? (
        <div className="open-voting-section__action-card">
          <div className="open-voting-section__action-copy">
            <h3>Abrir votacao da partida</h3>
            <p>
              Esta acao solicita ao backend a abertura conjunta de `MVP` e
              `BOLA_MURCHA`, sem inferir nada localmente sobre rodada ou
              vencedor.
            </p>
          </div>

          <Button
            loading={isOpeningVoting}
            onClick={() => void onOpenVoting()}
            type="button"
          >
            Abrir votacao
          </Button>
        </div>
      ) : null}
    </div>
  )
}
