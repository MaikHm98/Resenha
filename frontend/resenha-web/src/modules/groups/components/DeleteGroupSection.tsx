import { useState, type FormEvent } from 'react'
import { Alert, Button, Input } from '../../../shared/components'

type DeleteGroupSectionProps = {
  groupName: string
  isSubmitting: boolean
  error: string | null
  onConfirmDelete: () => Promise<boolean>
  onClearFeedback: () => void
}

export function DeleteGroupSection({
  groupName,
  isSubmitting,
  error,
  onConfirmDelete,
  onClearFeedback,
}: DeleteGroupSectionProps) {
  const [confirmationValue, setConfirmationValue] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const normalizedConfirmation = confirmationValue.trim()
  const canSubmit = normalizedConfirmation === groupName && !isSubmitting

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (normalizedConfirmation !== groupName) {
      setFieldError('Digite o nome exato do grupo para confirmar a exclusao.')
      return
    }

    setFieldError(null)
    await onConfirmDelete()
  }

  return (
    <div className="delete-group-section">
      <div className="delete-group-section__copy">
        <p>
          Esta acao faz a exclusao logica do grupo no backend. Para confirmar,
          digite <strong>{groupName}</strong> exatamente como aparece acima.
        </p>
      </div>

      {error ? (
        <Alert title="Nao foi possivel excluir o grupo" variant="warning">
          {error}
        </Alert>
      ) : null}

      <form className="delete-group-section__form" onSubmit={handleSubmit}>
        <Input
          autoComplete="off"
          disabled={isSubmitting}
          error={fieldError ?? undefined}
          hint="Confirmacao explicita obrigatoria"
          label="Digite o nome do grupo"
          onChange={(event) => {
            setConfirmationValue(event.target.value)
            setFieldError(null)
            onClearFeedback()
          }}
          placeholder={groupName}
          value={confirmationValue}
        />

        <div className="delete-group-section__actions">
          <Button
            disabled={!canSubmit}
            loading={isSubmitting}
            type="submit"
            variant="danger"
          >
            Excluir grupo
          </Button>
        </div>
      </form>
    </div>
  )
}
