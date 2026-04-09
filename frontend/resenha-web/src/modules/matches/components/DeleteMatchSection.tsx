import { useState, type FormEvent } from 'react'
import { Alert, Button, Input } from '../../../shared/components'

type DeleteMatchSectionProps = {
  matchId: number
  isSubmitting: boolean
  error: string | null
  onConfirmDelete: () => Promise<boolean>
  onClearFeedback: () => void
}

const CONFIRMATION_KEYWORD = 'EXCLUIR'

export function DeleteMatchSection({
  matchId,
  isSubmitting,
  error,
  onConfirmDelete,
  onClearFeedback,
}: DeleteMatchSectionProps) {
  const [confirmationValue, setConfirmationValue] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const normalizedConfirmation = confirmationValue.trim().toUpperCase()
  const canSubmit =
    normalizedConfirmation === CONFIRMATION_KEYWORD && !isSubmitting

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (normalizedConfirmation !== CONFIRMATION_KEYWORD) {
      setFieldError('Digite EXCLUIR para confirmar a exclusao da partida.')
      return
    }

    setFieldError(null)
    await onConfirmDelete()
  }

  return (
    <div className="delete-match-section">
      <div className="delete-match-section__copy">
        <p>
          Esta acao exclui a partida <strong>#{matchId}</strong> no backend.
          Para confirmar, digite <strong>{CONFIRMATION_KEYWORD}</strong>.
        </p>
      </div>

      {error ? (
        <Alert title="Nao foi possivel excluir a partida" variant="warning">
          {error}
        </Alert>
      ) : null}

      <form className="delete-match-section__form" onSubmit={handleSubmit}>
        <Input
          autoComplete="off"
          disabled={isSubmitting}
          error={fieldError ?? undefined}
          hint="Confirmacao explicita obrigatoria"
          label="Digite EXCLUIR"
          onChange={(event) => {
            setConfirmationValue(event.target.value)
            setFieldError(null)
            onClearFeedback()
          }}
          placeholder={CONFIRMATION_KEYWORD}
          value={confirmationValue}
        />

        <div className="delete-match-section__actions">
          <Button
            disabled={!canSubmit}
            loading={isSubmitting}
            type="submit"
            variant="danger"
          >
            Excluir partida
          </Button>
        </div>
      </form>
    </div>
  )
}
