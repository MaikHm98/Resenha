import { useState, type FormEvent } from 'react'
import { Alert, Button, Input } from '../../../shared/components'

type AddGuestFormProps = {
  isSubmitting: boolean
  guestError: string | null
  guestNotice: string | null
  onSubmit: (name: string) => Promise<boolean>
  onClearFeedback: () => void
}

export function AddGuestForm({
  isSubmitting,
  guestError,
  guestNotice,
  onSubmit,
  onClearFeedback,
}: AddGuestFormProps) {
  const [name, setName] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedName = name.trim()

    if (normalizedName.length === 0) {
      setFieldError('Informe o nome do convidado.')
      return
    }

    if (normalizedName.length > 120) {
      setFieldError('O nome do convidado deve ter no maximo 120 caracteres.')
      return
    }

    setFieldError(null)

    const didAddGuest = await onSubmit(normalizedName)

    if (!didAddGuest) {
      return
    }

    setName('')
  }

  return (
    <div className="add-guest-form__stack">
      {guestNotice ? (
        <Alert title="Convidado adicionado" variant="success">
          {guestNotice}
        </Alert>
      ) : null}

      {guestError ? (
        <Alert title="Nao foi possivel adicionar o convidado" variant="warning">
          {guestError}
        </Alert>
      ) : null}

      <form className="add-guest-form" onSubmit={handleSubmit}>
        <Input
          autoComplete="off"
          disabled={isSubmitting}
          error={fieldError ?? undefined}
          hint="O backend valida se a partida aceita convidados neste momento."
          label="Nome do convidado"
          maxLength={120}
          onChange={(event) => {
            setName(event.target.value)
            setFieldError(null)
            onClearFeedback()
          }}
          placeholder="Ex: Carlos"
          value={name}
        />

        <div className="add-guest-form__actions">
          <Button fullWidth loading={isSubmitting} type="submit">
            Adicionar convidado
          </Button>
        </div>
      </form>
    </div>
  )
}
