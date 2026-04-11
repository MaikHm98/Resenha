import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '../../../app/router/paths'
import { EmptyState } from '../../../shared/components'
import { normalizeApiError } from '../../../shared/lib/api'
import { ChangePasswordForm } from '../components/ChangePasswordForm'
import { useAuth } from '../hooks/useAuth'
import './ChangePasswordPage.css'

export function ChangePasswordPage() {
  const { session, changePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function clearFeedback() {
    if (error !== null) {
      setError(null)
    }

    if (success !== null) {
      setSuccess(null)
    }
  }

  function updateCurrentPassword(value: string) {
    clearFeedback()
    setCurrentPassword(value)
  }

  function updateNewPassword(value: string) {
    clearFeedback()
    setNewPassword(value)
  }

  function updateConfirmPassword(value: string) {
    clearFeedback()
    setConfirmPassword(value)
  }

  async function handleSubmit() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setSuccess(null)
      setError('Preencha senha atual, nova senha e confirmacao.')
      return
    }

    if (newPassword !== confirmPassword) {
      setSuccess(null)
      setError('A confirmacao da nova senha nao confere.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      await changePassword({
        senhaAtual: currentPassword,
        novaSenha: newPassword,
      })

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess(
        'Senha alterada com sucesso. Sua sessao continua ativa com o novo token devolvido pela API.',
      )
    } catch (submitError: unknown) {
      const normalizedError = normalizeApiError(submitError)
      setError(
        normalizedError.message ||
          'Nao foi possivel alterar a senha. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session) {
    return (
      <section
        className="change-password-page"
        aria-labelledby="change-password-page-title"
      >
        <section
          className="change-password-page__state-panel"
          aria-label="Seguranca da conta indisponivel"
        >
          <EmptyState
            action={
              <Link
                className="change-password-page__link change-password-page__link--primary"
                to={ROUTE_PATHS.PROFILE}
              >
                Voltar para perfil
              </Link>
            }
            description="Se a sua sessao ainda estiver valida, tente acessar esta tela novamente em alguns instantes."
            title="Sessao indisponivel para troca de senha"
          />
        </section>
      </section>
    )
  }

  const emailLabel = session.userEmail ?? 'Nao disponivel nesta sessao'
  const securityFlowStateLabel = isSubmitting
    ? 'Atualizando senha'
    : success
      ? 'Senha atualizada'
      : error
        ? 'Requer revisao'
        : 'Pronto para salvar'

  const securityFlowStateDescription = isSubmitting
    ? 'A resposta da API esta sendo aguardada para manter a sessao protegida.'
    : success
      ? 'A sessao atual ja recebeu o novo token devolvido pela API.'
      : error
        ? 'Revise os campos informados e tente novamente quando estiver pronto.'
        : 'Preencha os campos abaixo para atualizar a senha sem encerrar a sessao atual.'

  return (
    <section
      className="change-password-page"
      aria-labelledby="change-password-page-title"
    >
      <header className="change-password-page__hero">
        <div className="change-password-page__breadcrumbs">
          <Link to={ROUTE_PATHS.PROFILE}>Perfil</Link>
          <span>/</span>
          <span>Senha</span>
        </div>

        <div className="change-password-page__hero-content">
          <div>
            <p className="change-password-page__route">Conta protegida</p>
            <h1 className="app-title" id="change-password-page-title">
              Seguranca da conta
            </h1>
            <p className="app-subtitle">
              Troque sua senha e continue na resenha com a sessao ativa e o
              acesso protegido.
            </p>
          </div>

          <div className="change-password-page__hero-actions">
            <Link
              className="change-password-page__link change-password-page__link--primary"
              to={ROUTE_PATHS.PROFILE}
            >
              Voltar ao perfil
            </Link>
            <Link className="change-password-page__link" to={ROUTE_PATHS.HOME}>
              Ir para inicio
            </Link>
          </div>
        </div>

        <div className="change-password-page__hero-highlights">
          <article className="change-password-page__hero-card">
            <p className="change-password-page__hero-card-label">Sessao</p>
            <strong className="change-password-page__hero-card-title">
              Permanece autenticada
            </strong>
            <p className="change-password-page__hero-card-copy">
              O fluxo nao derruba a sessao depois do sucesso.
            </p>
          </article>

          <article className="change-password-page__hero-card">
            <p className="change-password-page__hero-card-label">Validacao</p>
            <strong className="change-password-page__hero-card-title">
              Regras no backend
            </strong>
            <p className="change-password-page__hero-card-copy">
              A politica final da senha continua sendo validada pela API.
            </p>
          </article>

          <article className="change-password-page__hero-card">
            <p className="change-password-page__hero-card-label">Conta</p>
            <strong className="change-password-page__hero-card-title">
              {session.userName}
            </strong>
            <p className="change-password-page__hero-card-copy">{emailLabel}</p>
          </article>
        </div>
      </header>

      <section
        className="change-password-page__flow-grid"
        aria-label="Contexto atual do fluxo de seguranca"
      >
        <article className="change-password-page__flow-card">
          <p className="change-password-page__flow-card-label">Estado atual</p>
          <strong className="change-password-page__flow-card-title">
            {securityFlowStateLabel}
          </strong>
          <p className="change-password-page__flow-card-copy">
            {securityFlowStateDescription}
          </p>
        </article>

        <article className="change-password-page__flow-card">
          <p className="change-password-page__flow-card-label">Conta ativa</p>
          <strong className="change-password-page__flow-card-title">
            {session.userName}
          </strong>
          <p className="change-password-page__flow-card-copy">{emailLabel}</p>
        </article>

        <article className="change-password-page__flow-card">
          <p className="change-password-page__flow-card-label">Navegacao</p>
          <strong className="change-password-page__flow-card-title">
            Volta rapida ao perfil
          </strong>
          <p className="change-password-page__flow-card-copy">
            Depois do sucesso, a experiencia continua autenticada para seguir
            navegando normalmente.
          </p>
          <div className="change-password-page__flow-card-action">
            <Link className="change-password-page__link" to={ROUTE_PATHS.PROFILE}>
              Voltar ao perfil
            </Link>
          </div>
        </article>
      </section>

      <div className="change-password-page__content">
        <section
          className="change-password-page__panel change-password-page__panel--form"
          aria-labelledby="change-password-panel-title"
        >
          <header className="change-password-page__panel-header">
            <div>
              <h2 id="change-password-panel-title">Atualizar senha</h2>
              <p>
                O novo token devolvido pela API e salvo logo apos o sucesso,
                mantendo os estados de erro, loading e sucesso claros no mesmo
                bloco de seguranca.
              </p>
            </div>
            <span className="change-password-page__badge">Sessao ativa</span>
          </header>

          <ChangePasswordForm
            confirmPassword={confirmPassword}
            currentPassword={currentPassword}
            error={error}
            isSubmitting={isSubmitting}
            newPassword={newPassword}
            onConfirmPasswordChange={updateConfirmPassword}
            onCurrentPasswordChange={updateCurrentPassword}
            onNewPasswordChange={updateNewPassword}
            onSubmit={() => void handleSubmit()}
            success={success}
          />
        </section>

        <section
          className="change-password-page__panel"
          aria-labelledby="change-password-session-title"
        >
          <header className="change-password-page__panel-header">
            <div>
              <h2 id="change-password-session-title">Como fica a sessao</h2>
              <p>
                O fluxo reutiliza a sessao autenticada atual e troca o token
                somente quando a API devolver um novo valor valido.
              </p>
            </div>
            <span className="change-password-page__badge change-password-page__badge--outline">
              Conta
            </span>
          </header>

          <ul className="change-password-page__notes">
            <li className="change-password-page__note">
              <strong>Token novo salvo na hora</strong>
              <p>
                O `AuthProvider` salva imediatamente o token retornado pela API,
                mantendo as proximas chamadas autenticadas.
              </p>
            </li>
            <li className="change-password-page__note">
              <strong>Metadados atualizados junto</strong>
              <p>
                Nome, email e demais campos devolvidos pela API seguem o mesmo
                merge seguro da sessao.
              </p>
            </li>
            <li className="change-password-page__note">
              <strong>Nenhum logout depois do sucesso</strong>
              <p>
                A experiencia continua autenticada para o usuario voltar ao
                perfil ou seguir navegando normalmente.
              </p>
            </li>
          </ul>
        </section>
      </div>
    </section>
  )
}
