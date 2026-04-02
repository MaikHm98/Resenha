import { type FormEvent, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../../../app/router/paths'
import { Alert, Button, Input } from '../../../shared/components'
import { isNormalizedApiError } from '../../../shared/lib/api'
import { useAuth } from '../hooks/useAuth'
import './LoginPage.css'

type RouteLike = {
  pathname?: unknown
  search?: unknown
  hash?: unknown
}

type LoginLocationState = {
  from?: RouteLike
}

function resolveRedirectTo(state: unknown): string {
  if (typeof state !== 'object' || state === null) {
    return ROUTE_PATHS.HOME
  }

  const from = (state as LoginLocationState).from
  if (typeof from !== 'object' || from === null) {
    return ROUTE_PATHS.HOME
  }

  const pathname = typeof from.pathname === 'string' ? from.pathname : ''
  const search = typeof from.search === 'string' ? from.search : ''
  const hash = typeof from.hash === 'string' ? from.hash : ''

  if (!pathname || pathname === ROUTE_PATHS.LOGIN) {
    return ROUTE_PATHS.HOME
  }

  return `${pathname}${search}${hash}`
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = useMemo(
    () => resolveRedirectTo(location.state),
    [location.state],
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro(null)

    const normalizedEmail = email.trim().toLowerCase()
    const passwordValue = senha.trim()

    if (!normalizedEmail || !passwordValue) {
      setErro('Informe email e senha para entrar.')
      return
    }

    setIsSubmitting(true)

    try {
      await login({
        email: normalizedEmail,
        senha: passwordValue,
      })
      navigate(redirectTo, { replace: true })
    } catch (error: unknown) {
      if (isNormalizedApiError(error)) {
        setErro(error.message)
      } else {
        setErro('Nao foi possivel entrar. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-card" aria-labelledby="login-title">
      <header>
        <h1 className="app-title" id="login-title">
          Entrar
        </h1>
        <p className="app-subtitle">
          Acesse sua conta para continuar no Resenha Web.
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
        <Input
          autoComplete="current-password"
          disabled={isSubmitting}
          label="Senha"
          onChange={(event) => setSenha(event.currentTarget.value)}
          placeholder="Sua senha"
          type="password"
          value={senha}
        />

        {erro ? (
          <Alert title="Erro ao entrar" variant="error">
            {erro}
          </Alert>
        ) : null}

        <Button fullWidth loading={isSubmitting} type="submit">
          Entrar
        </Button>
      </form>

      <footer className="auth-footer-links" aria-label="Acessos auxiliares">
        <Link to={ROUTE_PATHS.REGISTER}>Criar conta</Link>
        <Link to={ROUTE_PATHS.FORGOT_PASSWORD}>Esqueci minha senha</Link>
      </footer>
    </section>
  )
}
