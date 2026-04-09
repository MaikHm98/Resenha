import { useState, type FormEvent } from 'react'
import { Alert, Button, Input } from '../../../shared/components'
import type { AddGroupMemberResult } from '../types/groupsContracts'

type InviteMemberFormProps = {
  isSubmitting: boolean
  inviteError: string | null
  inviteResult: AddGroupMemberResult | null
  onSubmit: (email: string) => Promise<boolean>
  onClearFeedback: () => void
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getInviteSuccessTitle(result: AddGroupMemberResult): string {
  if (result.acao === 'ADDED') {
    return 'Jogador adicionado ao grupo'
  }

  return 'Convite enviado para o grupo'
}

export function InviteMemberForm({
  isSubmitting,
  inviteError,
  inviteResult,
  onSubmit,
  onClearFeedback,
}: InviteMemberFormProps) {
  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
      setFieldError('Informe um e-mail valido para convidar o jogador.')
      return
    }

    setFieldError(null)

    const didInvite = await onSubmit(normalizedEmail)

    if (!didInvite) {
      return
    }

    setEmail('')
  }

  return (
    <div className="invite-member-form__stack">
      {inviteResult ? (
        <Alert title={getInviteSuccessTitle(inviteResult)} variant="success">
          {inviteResult.mensagem}
        </Alert>
      ) : null}

      {inviteError ? (
        <Alert title="Nao foi possivel convidar este jogador" variant="warning">
          {inviteError}
        </Alert>
      ) : null}

      <form className="invite-member-form" onSubmit={handleSubmit}>
        <Input
          autoComplete="email"
          disabled={isSubmitting}
          error={fieldError ?? undefined}
          hint="O backend decide se o retorno sera ADDED ou INVITED."
          label="E-mail do jogador"
          onChange={(event) => {
            setEmail(event.target.value)
            setFieldError(null)
            onClearFeedback()
          }}
          placeholder="jogador@email.com"
          type="email"
          value={email}
        />

        <div className="invite-member-form__actions">
          <Button fullWidth loading={isSubmitting} type="submit">
            Convidar por e-mail
          </Button>
        </div>
      </form>
    </div>
  )
}
