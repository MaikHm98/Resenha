import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../../../app/router/paths'
import { Alert, Button, Input } from '../../../shared/components'
import { isNormalizedApiError } from '../../../shared/lib/api'
import { useAuth } from '../hooks/useAuth'
import './LoginPage.css'
import './RegisterPage.css'

type PlayerPositionOption = {
  value: string
  label: string
}

type DominantFootOption = {
  value: string
  label: string
}

const POSITION_OPTIONS: PlayerPositionOption[] = [
  { value: 'GOLEIRO', label: 'Goleiro' },
  { value: 'ZAGUEIRO', label: 'Zagueiro' },
  { value: 'LATERAL', label: 'Lateral' },
  { value: 'VOLANTE', label: 'Volante' },
  { value: 'MEIA', label: 'Meia' },
  { value: 'PONTA', label: 'Ponta' },
  { value: 'ATACANTE', label: 'Atacante' },
]

const DOMINANT_FOOT_OPTIONS: DominantFootOption[] = [
  { value: 'DIREITO', label: 'Direito' },
  { value: 'ESQUERDO', label: 'Esquerdo' },
  { value: 'AMBIDESTRO', label: 'Ambidestro' },
]

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [posicaoPrincipal, setPosicaoPrincipal] = useState('')
  const [peDominante, setPeDominante] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro(null)

    const nomeValue = nome.trim()
    const emailValue = email.trim().toLowerCase()
    const senhaValue = senha

    if (!nomeValue || !emailValue || !senhaValue) {
      setErro('Preencha nome, email e senha.')
      return
    }

    if (!emailValue.includes('@')) {
      setErro('Informe um email valido.')
      return
    }

    if (nomeValue.length < 2) {
      setErro('Nome deve ter pelo menos 2 caracteres.')
      return
    }

    if (senhaValue.length < 8) {
      setErro('Senha deve ter pelo menos 8 caracteres.')
      return
    }

    if (!posicaoPrincipal || !peDominante) {
      setErro('Selecione posicao principal e pe dominante.')
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        nome: nomeValue,
        email: emailValue,
        senha: senhaValue,
        posicaoPrincipal,
        peDominante,
      })
      navigate(ROUTE_PATHS.HOME, { replace: true })
    } catch (error: unknown) {
      if (isNormalizedApiError(error)) {
        setErro(error.message)
      } else {
        setErro('Nao foi possivel concluir o cadastro. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-card" aria-labelledby="register-title">
      <header className="auth-card__header">
        <span className="auth-card__match-tag">Criar conta</span>

        <div className="auth-card__brand">
          <p className="auth-card__brand-name">Resenha App</p>
          <h1 className="auth-card__title" id="register-title">
            Monte seu perfil
          </h1>
          <p className="auth-card__copy">
            Complete seu cadastro com os dados esportivos do app e entre no
            jogo pelo web.
          </p>
        </div>
      </header>

      <form className="auth-form" onSubmit={handleSubmit}>
        <Input
          autoComplete="name"
          disabled={isSubmitting}
          label="Nome"
          onChange={(event) => setNome(event.currentTarget.value)}
          placeholder="Seu nome"
          value={nome}
        />
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
          autoComplete="new-password"
          disabled={isSubmitting}
          hint="Minimo de 8 caracteres"
          label="Senha"
          onChange={(event) => setSenha(event.currentTarget.value)}
          placeholder="Crie uma senha"
          type="password"
          value={senha}
        />

        <div className="auth-select-grid">
          <label className="auth-select-field">
            <span className="auth-select-label">Posicao principal</span>
            <select
              className="auth-select-input"
              disabled={isSubmitting}
              onChange={(event) => setPosicaoPrincipal(event.currentTarget.value)}
              value={posicaoPrincipal}
            >
              <option value="">Selecione</option>
              {POSITION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="auth-select-field">
            <span className="auth-select-label">Pe dominante</span>
            <select
              className="auth-select-input"
              disabled={isSubmitting}
              onChange={(event) => setPeDominante(event.currentTarget.value)}
              value={peDominante}
            >
              <option value="">Selecione</option>
              {DOMINANT_FOOT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {erro ? (
          <Alert title="Erro no cadastro" variant="error">
            {erro}
          </Alert>
        ) : null}

        <Button fullWidth loading={isSubmitting} type="submit">
          Criar conta
        </Button>
      </form>

      <footer className="auth-footer-links" aria-label="Acessos auxiliares">
        <Link to={ROUTE_PATHS.LOGIN}>Ja tenho conta</Link>
      </footer>
    </section>
  )
}
