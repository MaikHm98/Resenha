import { Alert, Button, Input } from '../../../shared/components'

type ChangePasswordFormProps = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  isSubmitting: boolean
  error: string | null
  success: string | null
  onCurrentPasswordChange: (value: string) => void
  onNewPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onSubmit: () => void
}

export function ChangePasswordForm({
  currentPassword,
  newPassword,
  confirmPassword,
  isSubmitting,
  error,
  success,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: ChangePasswordFormProps) {
  return (
    <form
      className="change-password-form"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <p className="change-password-form__intro">
        A nova senha continua validada pela API. Quando a alteracao for aceita,
        a sessao recebe o novo token imediatamente.
      </p>

      <div className="change-password-form__status-stack" aria-live="polite">
        {error ? (
          <Alert title="Nao foi possivel alterar a senha" variant="error">
            {error}
          </Alert>
        ) : null}

        {success ? (
          <Alert title="Senha atualizada" variant="success">
            {success}
          </Alert>
        ) : null}
      </div>

      <section
        className="change-password-form__section"
        aria-labelledby="change-password-form-fields-title"
      >
        <div className="change-password-form__section-header">
          <div>
            <h2 id="change-password-form-fields-title">Dados da nova senha</h2>
            <p>
              A confirmacao e validada localmente para evitar envio
              inconsistente, enquanto a regra final continua na API.
            </p>
          </div>
          <span className="change-password-form__badge">Sessao ativa</span>
        </div>

        <div className="change-password-form__grid">
          <Input
            autoComplete="current-password"
            disabled={isSubmitting}
            label="Senha atual"
            onChange={(event) => onCurrentPasswordChange(event.currentTarget.value)}
            placeholder="Digite sua senha atual"
            type="password"
            value={currentPassword}
          />

          <Input
            autoComplete="new-password"
            disabled={isSubmitting}
            hint="A API continua validando a politica da nova senha."
            label="Nova senha"
            onChange={(event) => onNewPasswordChange(event.currentTarget.value)}
            placeholder="Digite a nova senha"
            type="password"
            value={newPassword}
          />

          <Input
            autoComplete="new-password"
            disabled={isSubmitting}
            hint="Repita a nova senha exatamente como digitou acima."
            label="Confirmar nova senha"
            onChange={(event) => onConfirmPasswordChange(event.currentTarget.value)}
            placeholder="Confirme a nova senha"
            type="password"
            value={confirmPassword}
          />
        </div>
      </section>

      <div className="change-password-form__footer">
        <span className="change-password-form__note">
          Nenhum logout automatico ocorre apos o sucesso.
        </span>

        <div className="change-password-form__actions">
          <Button loading={isSubmitting} type="submit">
            Salvar nova senha
          </Button>
        </div>
      </div>
    </form>
  )
}
