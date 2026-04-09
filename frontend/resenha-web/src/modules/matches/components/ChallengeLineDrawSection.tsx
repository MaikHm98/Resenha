import { useMemo, useState } from 'react'
import { Alert, Button, Input } from '../../../shared/components'
import type {
  MatchChallengeParity,
  MatchChallengeStatus,
} from '../types/challengeContracts'

type ChallengeLineDrawActionKind = 'startLineDraw' | 'submitLineDrawNumber'

type ChallengeLineDrawSectionProps = {
  challenge: MatchChallengeStatus
  lineDrawError: string | null
  lineDrawNotice: string | null
  activeAction: ChallengeLineDrawActionKind | null
  isSubmitting: boolean
  onStartLineDraw: (parity: MatchChallengeParity) => Promise<boolean>
  onSubmitLineDrawNumber: (number: number) => Promise<boolean>
  onClearFeedback: () => void
}

function getNumberStatusLabel(value: boolean): string {
  return value ? 'Ja informou' : 'Ainda nao informou'
}

export function ChallengeLineDrawSection({
  challenge,
  lineDrawError,
  lineDrawNotice,
  activeAction,
  isSubmitting,
  onStartLineDraw,
  onSubmitLineDrawNumber,
  onClearFeedback,
}: ChallengeLineDrawSectionProps) {
  const [lineDrawNumber, setLineDrawNumber] = useState('')
  const [lineDrawNumberError, setLineDrawNumberError] = useState<string | null>(
    null,
  )

  const canChooseParity = challenge.usuarioPodeEscolherParidade
  const canSubmitNumber = challenge.usuarioPodeInformarNumero
  const isStartingLineDraw = isSubmitting && activeAction === 'startLineDraw'
  const isSubmittingLineNumber =
    isSubmitting && activeAction === 'submitLineDrawNumber'

  const lineDrawSummary = useMemo(
    () => [
      {
        key: 'paridade-capitao',
        label: 'Paridade do capitao atual',
        value: challenge.paridadeCapitaoAtual ?? 'Ainda nao definida',
      },
      {
        key: 'paridade-desafiante',
        label: 'Paridade do desafiante',
        value: challenge.paridadeDesafiante ?? 'Ainda nao definida',
      },
      {
        key: 'numero-capitao',
        label: 'Numero do capitao atual',
        value: getNumberStatusLabel(challenge.capitaoAtualJaInformouNumero),
      },
      {
        key: 'numero-desafiante',
        label: 'Numero do desafiante',
        value: getNumberStatusLabel(challenge.desafianteJaInformouNumero),
      },
      {
        key: 'soma',
        label: 'Soma da linha',
        value:
          challenge.somaParImparLinha !== null
            ? String(challenge.somaParImparLinha)
            : 'Ainda nao disponivel',
      },
    ],
    [
      challenge.capitaoAtualJaInformouNumero,
      challenge.desafianteJaInformouNumero,
      challenge.paridadeCapitaoAtual,
      challenge.paridadeDesafiante,
      challenge.somaParImparLinha,
    ],
  )

  async function handleSubmitNumber() {
    const trimmedValue = lineDrawNumber.trim()

    if (!trimmedValue) {
      setLineDrawNumberError('Informe um numero entre 0 e 10.')
      return
    }

    const parsedNumber = Number.parseInt(trimmedValue, 10)

    if (
      Number.isNaN(parsedNumber) ||
      parsedNumber < 0 ||
      parsedNumber > 10
    ) {
      setLineDrawNumberError('Informe um numero inteiro entre 0 e 10.')
      return
    }

    setLineDrawNumberError(null)
    const didSubmit = await onSubmitLineDrawNumber(parsedNumber)

    if (didSubmit) {
      setLineDrawNumber('')
    }
  }

  return (
    <div className="challenge-line-draw-section">
      <header className="challenge-line-draw-section__header">
        <div>
          <h3 className="challenge-line-draw-section__title">Par ou impar da linha</h3>
          <p className="challenge-line-draw-section__description">
            Esta secao respeita apenas as flags do snapshot para mostrar ou
            habilitar as acoes da etapa de linha.
          </p>
        </div>
      </header>

      {lineDrawNotice || lineDrawError ? (
        <div className="challenge-line-draw-section__feedback">
          {lineDrawNotice ? (
            <Alert title="Linha atualizada" variant="success">
              {lineDrawNotice}
            </Alert>
          ) : null}
          {lineDrawError ? (
            <Alert title="Nao foi possivel atualizar a linha" variant="error">
              {lineDrawError}
            </Alert>
          ) : null}
          <div className="challenge-line-draw-section__feedback-actions">
            <Button onClick={onClearFeedback} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      <div className="challenge-line-draw-section__summary">
        {lineDrawSummary.map((item) => (
          <div className="challenge-line-draw-section__summary-card" key={item.key}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <div className="challenge-line-draw-section__actions-grid">
        <section className="challenge-line-draw-section__action-card">
          <div className="challenge-line-draw-section__action-copy">
            <h4>Escolher paridade</h4>
            <p>
              O backend decide quando o usuario pode iniciar `PAR` ou `IMPAR`
              para a linha.
            </p>
          </div>

          {canChooseParity ? (
            <div className="challenge-line-draw-section__button-row">
              <Button
                loading={isStartingLineDraw}
                onClick={() => void onStartLineDraw('PAR')}
                type="button"
              >
                Escolher PAR
              </Button>
              <Button
                loading={isStartingLineDraw}
                onClick={() => void onStartLineDraw('IMPAR')}
                type="button"
                variant="secondary"
              >
                Escolher IMPAR
              </Button>
            </div>
          ) : (
            <div className="challenge-line-draw-section__notice">
              <p>
                O snapshot atual nao permite iniciar a paridade da linha neste
                momento.
              </p>
            </div>
          )}
        </section>

        <section className="challenge-line-draw-section__action-card">
          <div className="challenge-line-draw-section__action-copy">
            <h4>Informar numero</h4>
            <p>
              O numero so fica disponivel quando o backend libera esta etapa no
              snapshot.
            </p>
          </div>

          {canSubmitNumber ? (
            <div className="challenge-line-draw-section__number-form">
              <Input
                error={lineDrawNumberError ?? undefined}
                hint="Valor inteiro entre 0 e 10."
                inputMode="numeric"
                label="Numero da linha"
                max="10"
                min="0"
                onChange={(event) => {
                  setLineDrawNumber(event.target.value)
                  if (lineDrawNumberError) {
                    setLineDrawNumberError(null)
                  }
                }}
                placeholder="Ex: 4"
                type="number"
                value={lineDrawNumber}
              />
              <div className="challenge-line-draw-section__button-row">
                <Button
                  loading={isSubmittingLineNumber}
                  onClick={() => void handleSubmitNumber()}
                  type="button"
                >
                  Informar numero
                </Button>
              </div>
            </div>
          ) : (
            <div className="challenge-line-draw-section__notice">
              <p>
                O snapshot atual nao permite informar numero da linha neste
                momento.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
