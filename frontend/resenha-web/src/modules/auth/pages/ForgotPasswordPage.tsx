import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '../../../app/router/paths'
import { Alert, Button, Input } from '../../../shared/components'
import { isNormalizedApiError } from '../../../shared/lib/api'
import { useAuth } from '../hooks/useAuth'
import './LoginPage.css'
import './RecoveryPages.css'

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro(null)
    setSucesso(null)

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      setErro('Informe o email para recuperar a senha.')
      return
    }

    if (!normalizedEmail.includes('@')) {
      setErro('Informe um email valido.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await forgotPassword({ email: normalizedEmail })
      setSucesso(response.mensagem)
    } catch (error: unknown) {
      if (isNormalizedApiError(error)) {
        setErro(error.message)
      } else {
        setErro('Nao foi possivel solicitar a recuperacao. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-card" aria-labelledby="forgot-password-title">
      <header>
        <h1 className="app-title" id="forgot-password-title">
          Recuperar senha
        </h1>
        <p className="app-subtitle">
          Informe seu email para receber instrucoes de redefinicao.
        </p>
      </header>

      <form className="auth-form" onSubmit={handleSubmit}>
        <Input
          autoComplete="email"
          disabled={isSubmitting}
          label="Email"
          onChange={(event) => setEmail(event.currentTarget.value)}
          placeholder="voce@email.com"
          type="email"
          value={email}
        />

        {erro ? (
          <Alert title="Erro na solicitacao" variant="error">
            {erro}
          </Alert>
        ) : null}

        {sucesso ? (
          <Alert title="Solicitacao enviada" variant="success">
            {sucesso}
          </Alert>
        ) : null}

        <Button fullWidth loading={isSubmitting} type="submit">
          Enviar instrucoes
        </Button>
      </form>

      <footer className="auth-footer-links" aria-label="Acessos auxiliares">
        <Link to={ROUTE_PATHS.LOGIN}>Voltar para login</Link>
        <Link to={ROUTE_PATHS.RESET_PASSWORD}>Ja tenho token</Link>
      </footer>
    </section>
  )
}
