import { useMemo, useState } from 'react'
import { Alert, Button, Input } from '../../../shared/components'
import { ChallengeAvailablePlayersPanel } from './ChallengeAvailablePlayersPanel'
import type {
  MatchChallengeParity,
  MatchChallengePlayer,
  MatchChallengeStatus,
} from '../types/challengeContracts'

type ChallengeGoalkeeperActionKind =
  | 'startGoalkeeperDraw'
  | 'submitGoalkeeperDrawNumber'

type ChallengeGoalkeeperSectionProps = {
  challenge: MatchChallengeStatus
  goalkeeperError: string | null
  goalkeeperNotice: string | null
  activeAction: ChallengeGoalkeeperActionKind | null
  activeGoalkeeperPickPlayerId: number | null
  isSubmittingGoalkeeper: boolean
  isPickingGoalkeeper: boolean
  onStartGoalkeeperDraw: (parity: MatchChallengeParity) => Promise<boolean>
  onSubmitGoalkeeperDrawNumber: (number: number) => Promise<boolean>
  onPickGoalkeeper: (player: MatchChallengePlayer) => Promise<boolean>
  onClearFeedback: () => void
}

function getNumberStatusLabel(value: boolean): string {
  return value ? 'Ja informou' : 'Ainda nao informou'
}

export function ChallengeGoalkeeperSection({
  challenge,
  goalkeeperError,
  goalkeeperNotice,
  activeAction,
  activeGoalkeeperPickPlayerId,
  isSubmittingGoalkeeper,
  isPickingGoalkeeper,
  onStartGoalkeeperDraw,
  onSubmitGoalkeeperDrawNumber,
  onPickGoalkeeper,
  onClearFeedback,
}: ChallengeGoalkeeperSectionProps) {
  const [goalkeeperNumber, setGoalkeeperNumber] = useState('')
  const [goalkeeperNumberError, setGoalkeeperNumberError] = useState<string | null>(
    null,
  )

  const isManualGoalkeeperState =
    challenge.statusDesafio === 'DEFINICAO_MANUAL_GOLEIRO' ||
    challenge.requerDefinicaoManualGoleiro
  const canChooseParity =
    !isManualGoalkeeperState && challenge.usuarioPodeEscolherParidadeGoleiro
  const canSubmitNumber =
    !isManualGoalkeeperState && challenge.usuarioPodeInformarNumeroGoleiro
  const canPickGoalkeeper =
    !isManualGoalkeeperState && challenge.usuarioPodeEscolherGoleiro
  const isStartingGoalkeeperDraw =
    isSubmittingGoalkeeper && activeAction === 'startGoalkeeperDraw'
  const isSubmittingGoalkeeperNumber =
    isSubmittingGoalkeeper && activeAction === 'submitGoalkeeperDrawNumber'

  const goalkeeperSummary = useMemo(
    () => [
      {
        key: 'paridade-capitao-goleiro',
        label: 'Paridade do capitao atual',
        value: challenge.paridadeCapitaoAtualGoleiro ?? 'Ainda nao definida',
      },
      {
        key: 'paridade-desafiante-goleiro',
        label: 'Paridade do desafiante',
        value: challenge.paridadeDesafianteGoleiro ?? 'Ainda nao definida',
      },
      {
        key: 'numero-capitao-goleiro',
        label: 'Numero do capitao atual',
        value: getNumberStatusLabel(challenge.capitaoAtualJaInformouNumeroGoleiro),
      },
      {
        key: 'numero-desafiante-goleiro',
        label: 'Numero do desafiante',
        value: getNumberStatusLabel(challenge.desafianteJaInformouNumeroGoleiro),
      },
      {
        key: 'soma-goleiros',
        label: 'Soma dos goleiros',
        value:
          challenge.somaParImparGoleiro !== null
            ? String(challenge.somaParImparGoleiro)
            : 'Ainda nao disponivel',
      },
    ],
    [
      challenge.capitaoAtualJaInformouNumeroGoleiro,
      challenge.desafianteJaInformouNumeroGoleiro,
      challenge.paridadeCapitaoAtualGoleiro,
      challenge.paridadeDesafianteGoleiro,
      challenge.somaParImparGoleiro,
    ],
  )

  async function handleSubmitNumber() {
    const trimmedValue = goalkeeperNumber.trim()

    if (!trimmedValue) {
      setGoalkeeperNumberError('Informe um numero entre 0 e 10.')
      return
    }

    const parsedNumber = Number.parseInt(trimmedValue, 10)

    if (Number.isNaN(parsedNumber) || parsedNumber < 0 || parsedNumber > 10) {
      setGoalkeeperNumberError('Informe um numero inteiro entre 0 e 10.')
      return
    }

    setGoalkeeperNumberError(null)
    const didSubmit = await onSubmitGoalkeeperDrawNumber(parsedNumber)

    if (didSubmit) {
      setGoalkeeperNumber('')
    }
  }

  return (
    <div className="challenge-goalkeeper-section">
      <header className="challenge-goalkeeper-section__header">
        <div>
          <h3 className="challenge-goalkeeper-section__title">
            Etapa de goleiros
          </h3>
          <p className="challenge-goalkeeper-section__description">
            Esta secao continua refletindo apenas o snapshot do backend para a
            etapa de goleiros, sem inventar regra de bloqueio, paridade ou
            resolucao manual.
          </p>
        </div>
      </header>

      {goalkeeperNotice || goalkeeperError ? (
        <div className="challenge-goalkeeper-section__feedback">
          {goalkeeperNotice ? (
            <Alert title="Etapa de goleiros atualizada" variant="success">
              {goalkeeperNotice}
            </Alert>
          ) : null}
          {goalkeeperError ? (
            <Alert
              title="Nao foi possivel atualizar a etapa de goleiros"
              variant="error"
            >
              {goalkeeperError}
            </Alert>
          ) : null}
          <div className="challenge-goalkeeper-section__feedback-actions">
            <Button onClick={onClearFeedback} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      <div className="challenge-goalkeeper-section__summary">
        {goalkeeperSummary.map((item) => (
          <div
            className="challenge-goalkeeper-section__summary-card"
            key={item.key}
          >
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      {isManualGoalkeeperState ? (
        <div className="challenge-goalkeeper-section__manual-state">
          <Alert title="Definicao manual de goleiro" variant="warning">
            O backend sinalizou `DEFINICAO_MANUAL_GOLEIRO`. Esta etapa permanece
            somente leitura no web ate que o snapshot mude.
          </Alert>
        </div>
      ) : (
        <div className="challenge-goalkeeper-section__actions-grid">
          <section className="challenge-goalkeeper-section__action-card">
            <div className="challenge-goalkeeper-section__action-copy">
              <h4>Escolher paridade</h4>
              <p>
                A escolha de `PAR` ou `IMPAR` para goleiros so aparece quando o
                snapshot liberar essa acao.
              </p>
            </div>

            {canChooseParity ? (
              <div className="challenge-goalkeeper-section__button-row">
                <Button
                  loading={isStartingGoalkeeperDraw}
                  onClick={() => void onStartGoalkeeperDraw('PAR')}
                  type="button"
                >
                  Escolher PAR
                </Button>
                <Button
                  loading={isStartingGoalkeeperDraw}
                  onClick={() => void onStartGoalkeeperDraw('IMPAR')}
                  type="button"
                  variant="secondary"
                >
                  Escolher IMPAR
                </Button>
              </div>
            ) : (
              <div className="challenge-goalkeeper-section__notice">
                <p>
                  O snapshot atual nao permite escolher a paridade dos goleiros
                  neste momento.
                </p>
              </div>
            )}
          </section>

          <section className="challenge-goalkeeper-section__action-card">
            <div className="challenge-goalkeeper-section__action-copy">
              <h4>Informar numero</h4>
              <p>
                O numero dos goleiros so fica operacional quando o backend
                liberar esta etapa no snapshot.
              </p>
            </div>

            {canSubmitNumber ? (
              <div className="challenge-goalkeeper-section__number-form">
                <Input
                  error={goalkeeperNumberError ?? undefined}
                  hint="Valor inteiro entre 0 e 10."
                  inputMode="numeric"
                  label="Numero dos goleiros"
                  max="10"
                  min="0"
                  onChange={(event) => {
                    setGoalkeeperNumber(event.target.value)
                    if (goalkeeperNumberError) {
                      setGoalkeeperNumberError(null)
                    }
                  }}
                  placeholder="Ex: 6"
                  type="number"
                  value={goalkeeperNumber}
                />
                <div className="challenge-goalkeeper-section__button-row">
                  <Button
                    loading={isSubmittingGoalkeeperNumber}
                    onClick={() => void handleSubmitNumber()}
                    type="button"
                  >
                    Informar numero
                  </Button>
                </div>
              </div>
            ) : (
              <div className="challenge-goalkeeper-section__notice">
                <p>
                  O snapshot atual nao permite informar numero dos goleiros
                  neste momento.
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      <ChallengeAvailablePlayersPanel
        actionLabel="Escolher goleiro"
        actionLoadingPlayerId={activeGoalkeeperPickPlayerId}
        actionsEnabled={canPickGoalkeeper}
        emptyMessage="Nenhum goleiro disponivel neste snapshot."
        onAction={onPickGoalkeeper}
        players={challenge.goleirosDisponiveis}
        subtitle={
          isManualGoalkeeperState
            ? 'O backend colocou a etapa em definicao manual. Os goleiros ficam visiveis apenas para leitura.'
            : canPickGoalkeeper
              ? 'A lista vem diretamente do backend. O frontend apenas reflete quem esta disponivel no snapshot atual.'
              : 'O snapshot atual nao permite escolher goleiro para este usuario neste momento.'
        }
        title="Goleiros disponiveis"
        variant="goleiros"
      />

      {!isManualGoalkeeperState && !canPickGoalkeeper ? (
        <div className="challenge-goalkeeper-section__notice">
          <p>
            A escolha de goleiro continua bloqueada para este usuario neste
            momento, de acordo com o snapshot atual.
          </p>
        </div>
      ) : null}

      {isPickingGoalkeeper && activeGoalkeeperPickPlayerId === null ? (
        <div className="challenge-goalkeeper-section__notice">
          <p>Registrando escolha de goleiro...</p>
        </div>
      ) : null}
    </div>
  )
}
