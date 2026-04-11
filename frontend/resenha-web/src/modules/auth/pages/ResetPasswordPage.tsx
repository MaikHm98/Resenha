import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ROUTE_PATHS } from '../../../app/router/paths'
import { Alert, Button, Input } from '../../../shared/components'
import { isNormalizedApiError } from '../../../shared/lib/api'
import { useAuth } from '../hooks/useAuth'
import './LoginPage.css'
import './RecoveryPages.css'

type TokenValidationState = 'idle' | 'validating' | 'valid' | 'invalid'

export function ResetPasswordPage() {
  const { validateResetToken, resetPassword } = useAuth()
  const [searchParams] = useSearchParams()
  const [token, setToken] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [tokenValidation, setTokenValidation] = useState<TokenValidationState>('idle')
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateToken = useCallback(
    async (tokenToValidate: string) => {
      const tokenValue = tokenToValidate.trim()
      setErro(null)
      setSucesso(null)

      if (!tokenValue) {
        setTokenValidation('invalid')
        setErro('Informe um token para validar.')
        return false
      }

      setTokenValidation('validating')

      try {
        const isValid = await validateResetToken(tokenValue)
        if (!isValid) {
          setTokenValidation('invalid')
          setErro(null)
          return false
        }

        setTokenValidation('valid')
        return true
      } catch (error: unknown) {
        setTokenValidation('invalid')
        if (isNormalizedApiError(error)) {
          setErro(error.message)
        } else {
          setErro('Nao foi possivel validar o token. Tente novamente.')
        }
        return false
      }
    },
    [validateResetToken],
  )

  useEffect(() => {
    const tokenFromQuery = searchParams.get('token')?.trim() ?? ''
    if (!tokenFromQuery) {
      return
    }

    setToken(tokenFromQuery)
    void validateToken(tokenFromQuery)
  }, [searchParams, validateToken])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro(null)
    setSucesso(null)

    const tokenValue = token.trim()
    const passwordValue = novaSenha

    if (!tokenValue) {
      setErro('Informe o token de recuperacao.')
      return
    }

    if (passwordValue.length < 8) {
      setErro('A nova senha deve ter pelo menos 8 caracteres.')
      return
    }

    if (tokenValidation !== 'valid') {
      setErro('Valide um token valido antes de redefinir a senha.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await resetPassword({
        token: tokenValue,
        novaSenha: passwordValue,
      })
      setSucesso(response.mensagem)
      setNovaSenha('')
    } catch (error: unknown) {
      if (isNormalizedApiError(error)) {
        setErro(error.message)
      } else {
        setErro('Nao foi possivel redefinir a senha. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleTokenChange(nextToken: string) {
    setToken(nextToken)
    setTokenValidation('idle')
    setErro(null)
    setSucesso(null)
  }

  return (
    <section className="auth-card" aria-labelledby="reset-password-title">
      <header className="auth-card__header">
        <span className="auth-card__match-tag">Redefinir senha</span>

        <div className="auth-card__brand">
          <p className="auth-card__brand-name">Resenha App</p>
          <h1 className="auth-card__title" id="reset-password-title">
            Salvar nova senha
          </h1>
          <p className="auth-card__copy">
            Valide o token recebido por email e volte para a resenha com uma
            senha nova.
          </p>
        </div>
      </header>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="recovery-inline-actions">
          <Input
            autoComplete="one-time-code"
            disabled={isSubmitting || tokenValidation === 'validating'}
            label="Token de recuperacao"
            onChange={(event) => handleTokenChange(event.currentTarget.value)}
            placeholder="Cole o token aqui"
            value={token}
          />
          <Button
            className="recovery-secondary-action"
            disabled={isSubmitting}
            loading={tokenValidation === 'validating'}
            onClick={() => void validateToken(token)}
            type="button"
            variant="secondary"
          >
            Validar token
          </Button>
        </div>

        {tokenValidation === 'valid' ? (
          <Alert title="Token valido" variant="success">
            Token validado com sucesso. Agora voce pode redefinir a senha.
          </Alert>
        ) : null}

        {tokenValidation === 'invalid' ? (
          <Alert title="Token invalido" variant="warning">
            Solicite um novo token para continuar a redefinicao.
          </Alert>
        ) : null}

        <Input
          autoComplete="new-password"
          disabled={isSubmitting}
          hint="Minimo de 8 caracteres"
          label="Nova senha"
          onChange={(event) => setNovaSenha(event.currentTarget.value)}
          placeholder="Digite a nova senha"
          type="password"
          value={novaSenha}
        />

        {erro ? (
          <Alert title="Erro na redefinicao" variant="error">
            {erro}
          </Alert>
        ) : null}

        {sucesso ? (
          <Alert title="Senha atualizada" variant="success">
            {sucesso}
          </Alert>
        ) : null}

        <Button
          disabled={tokenValidation !== 'valid'}
          fullWidth
          loading={isSubmitting}
          type="submit"
        >
          Salvar nova senha
        </Button>
      </form>

      <footer className="auth-footer-links" aria-label="Acessos auxiliares">
        <Link to={ROUTE_PATHS.FORGOT_PASSWORD}>Solicitar novo token</Link>
        <Link to={ROUTE_PATHS.LOGIN}>Voltar para login</Link>
      </footer>
    </section>
  )
}
