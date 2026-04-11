import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '../../../app/router/paths'
import { Alert, EmptyState } from '../../../shared/components'
import { ProfileForm } from '../../auth/components/ProfileForm'
import { ProfileSummaryCard } from '../../auth/components/ProfileSummaryCard'
import { useProfilePageData } from '../../auth/hooks/useProfilePageData'
import './ProfilePage.css'

export function ProfilePage() {
  const {
    session,
    hasPartialSnapshot,
    summary,
    accountFields,
    formValues,
    positionOptions,
    dominantFootOptions,
    clubOptions,
    isClubOptionsLoading,
    clubOptionsError,
    isSavingProfile,
    saveError,
    saveSuccess,
    hasPendingChanges,
    setName,
    setGoleiro,
    setTimeCoracaoCodigo,
    setPosicaoPrincipal,
    setPeDominante,
    submitProfile,
  } = useProfilePageData()

  const profileFlowStateLabel = isSavingProfile
    ? 'Salvando alteracoes'
    : saveSuccess
      ? 'Perfil atualizado'
      : saveError
        ? 'Requer revisao'
        : hasPendingChanges
          ? 'Alteracoes pendentes'
          : 'Perfil sincronizado'

  const profileFlowStateDescription = isSavingProfile
    ? 'Seus ajustes estao sendo enviados para confirmar o novo perfil.'
    : saveSuccess
      ? 'O perfil ja foi atualizado e refletido na sua sessao atual.'
      : saveError
        ? 'Revise os dados do formulario e tente novamente quando estiver pronto.'
        : hasPendingChanges
          ? 'Existem mudancas prontas para salvar no seu perfil.'
          : 'Seu perfil ja esta alinhado com a sessao atual.'

  const clubFlowLabel = isClubOptionsLoading
    ? 'Carregando clubes'
    : clubOptionsError
      ? 'Clubes parcialmente disponiveis'
      : `${clubOptions.length} opcoes carregadas`

  const clubFlowDescription = isClubOptionsLoading
    ? 'Estamos trazendo a lista de clubes para completar seu perfil.'
    : clubOptionsError
      ? 'Voce ainda pode editar o restante do perfil mesmo sem a lista completa.'
      : 'A lista de clubes ja esta pronta para uso.'

  return (
    <section className="profile-page" aria-labelledby="profile-page-title">
      <header className="profile-page__hero">
        <div className="profile-page__hero-content">
          <div>
            <p className="profile-page__route">Meu vestiario</p>
            <h1 className="app-title" id="profile-page-title">
              Perfil e conta
            </h1>
            <p className="app-subtitle">
              Ajuste seus dados de jogo e mantenha a conta pronta para entrar em campo.
            </p>
          </div>

          <div className="profile-page__hero-actions">
            <Link
              className="profile-page__link profile-page__link--primary"
              to={ROUTE_PATHS.HOME}
            >
              Voltar para Home
            </Link>
            <Link className="profile-page__link" to={ROUTE_PATHS.MATCHES}>
              Ir para partidas
            </Link>
            <Link
              className="profile-page__link"
              to={ROUTE_PATHS.PROFILE_CHANGE_PASSWORD}
            >
              Seguranca da conta
            </Link>
          </div>
        </div>

        <div className="profile-page__hero-highlights">
          <article className="profile-page__hero-card">
            <p className="profile-page__hero-card-label">Sessao</p>
            <strong className="profile-page__hero-card-title">
              {hasPartialSnapshot ? 'Dados parciais' : 'Dados em dia'}
            </strong>
            <p className="profile-page__hero-card-copy">
              Mesmo quando faltam alguns dados, a conta continua segura para voce atualizar o perfil.
            </p>
          </article>

          <article className="profile-page__hero-card">
            <p className="profile-page__hero-card-label">Perfil</p>
            <strong className="profile-page__hero-card-title">
              Dados do jogador
            </strong>
            <p className="profile-page__hero-card-copy">
              Nome, goleiro, clube, posicao principal e pe dominante ficam centralizados aqui.
            </p>
          </article>

          <article className="profile-page__hero-card">
            <p className="profile-page__hero-card-label">Conta</p>
            <strong className="profile-page__hero-card-title">
              Seguranca separada
            </strong>
            <p className="profile-page__hero-card-copy">
              O email segue em leitura e a senha fica em uma area dedicada da conta.
            </p>
          </article>
        </div>
      </header>

      {hasPartialSnapshot ? (
        <Alert title="Sessao com metadados parciais" variant="warning">
          Alguns dados ainda nao chegaram nesta sessao da web, mas voce pode continuar usando a tela e completar o perfil normalmente.
        </Alert>
      ) : null}

      {session ? (
        <section
          className="profile-page__flow-grid"
          aria-label="Contexto atual do fluxo de perfil"
        >
          <article className="profile-page__flow-card">
            <p className="profile-page__flow-card-label">Estado atual</p>
            <strong className="profile-page__flow-card-title">
              {profileFlowStateLabel}
            </strong>
            <p className="profile-page__flow-card-copy">
              {profileFlowStateDescription}
            </p>
          </article>

          <article className="profile-page__flow-card">
            <p className="profile-page__flow-card-label">Clubes</p>
            <strong className="profile-page__flow-card-title">
              {clubFlowLabel}
            </strong>
            <p className="profile-page__flow-card-copy">
              {clubFlowDescription}
            </p>
          </article>

          <article className="profile-page__flow-card">
            <p className="profile-page__flow-card-label">Seguranca da conta</p>
            <strong className="profile-page__flow-card-title">
              Troca de senha dedicada
            </strong>
            <p className="profile-page__flow-card-copy">
              A seguranca da conta fica separada da edicao do perfil, com acesso rapido por esta mesma area.
            </p>
            <div className="profile-page__flow-card-action">
              <Link
                className="profile-page__link"
                to={ROUTE_PATHS.PROFILE_CHANGE_PASSWORD}
              >
                Abrir seguranca
              </Link>
            </div>
          </article>
        </section>
      ) : null}

      {!session ? (
        <section className="profile-page__state-panel" aria-label="Perfil indisponivel">
          <EmptyState
            action={
              <Link
                className="profile-page__link profile-page__link--primary"
                to={ROUTE_PATHS.HOME}
              >
                Voltar para Home
              </Link>
            }
            description="Se a sua sessao ainda estiver valida, tente acessar esta tela novamente em alguns instantes."
            title="Snapshot do perfil indisponivel"
          />
        </section>
      ) : (
        <div className="profile-page__content">
          <section
            className="profile-page__panel profile-page__panel--summary"
            aria-labelledby="profile-summary-title"
          >
            <header className="profile-page__panel-header">
              <div>
                <h2 id="profile-summary-title">Resumo da conta</h2>
                <p>
                  Um resumo rapido da sua conta para conferir como o perfil esta aparecendo agora.
                </p>
              </div>
              <span className="profile-page__badge">
                {hasPartialSnapshot ? 'Parcial' : 'Completa'}
              </span>
            </header>

            <ProfileSummaryCard
              clubLabel={summary.clubLabel}
              emailLabel={summary.emailLabel}
              initials={summary.initials}
              name={summary.name}
              primaryRoleLabel={summary.primaryRoleLabel}
              sessionStatusDescription={summary.sessionStatusDescription}
              sessionStatusLabel={summary.sessionStatusLabel}
            />
          </section>

          <section
            className="profile-page__panel"
            aria-labelledby="profile-account-title"
          >
            <header className="profile-page__panel-header">
              <div>
                <h2 id="profile-account-title">Conta</h2>
                <p>
                  Dados principais da sua conta em leitura, com consulta simples em qualquer tela.
                </p>
              </div>
              <span className="profile-page__badge profile-page__badge--outline">
                Conta
              </span>
            </header>

            <dl className="profile-page__details-grid">
              {accountFields.map((field) => (
                <div className="profile-page__detail-card" key={field.label}>
                  <dt>{field.label}</dt>
                  <dd>{field.value}</dd>
                  {field.hint ? <p>{field.hint}</p> : null}
                </div>
              ))}
            </dl>
          </section>

          <section
            className="profile-page__panel profile-page__panel--form"
            aria-labelledby="profile-form-title"
          >
            <header className="profile-page__panel-header">
              <div>
                <h2 id="profile-form-title">Editar perfil</h2>
                <p>
                  Ajuste os campos disponiveis do seu perfil e acompanhe o resultado sem sair desta tela.
                </p>
              </div>
              <span className="profile-page__badge">Perfil</span>
            </header>

            <ProfileForm
              clubOptions={clubOptions}
              clubOptionsError={clubOptionsError}
              dominantFootOptions={dominantFootOptions}
              formValues={formValues}
              hasPendingChanges={hasPendingChanges}
              isClubOptionsLoading={isClubOptionsLoading}
              isSaving={isSavingProfile}
              onGoleiroChange={setGoleiro}
              onNameChange={setName}
              onPeDominanteChange={setPeDominante}
              onPosicaoPrincipalChange={setPosicaoPrincipal}
              onSubmit={() => void submitProfile()}
              onTimeCoracaoCodigoChange={setTimeCoracaoCodigo}
              positionOptions={positionOptions}
              saveError={saveError}
              saveSuccess={saveSuccess}
            />
          </section>

          <section
            className="profile-page__panel"
            aria-labelledby="profile-security-title"
          >
            <header className="profile-page__panel-header">
              <div>
                <h2 id="profile-security-title">Seguranca da conta</h2>
                <p>
                  A troca de senha fica em uma area dedicada da conta para manter o acesso protegido.
                </p>
              </div>
              <span className="profile-page__badge profile-page__badge--outline">
                Seguranca
              </span>
            </header>

            <ul className="profile-page__next-steps-list">
              <li className="profile-page__next-step">
                <strong>Trocar senha com sessao ativa</strong>
                <p>
                  Voce atualiza a senha sem perder o contexto da conta e volta ao perfil quando quiser.
                </p>
              </li>
              <li className="profile-page__next-step">
                <strong>Voltar para o perfil quando quiser</strong>
                <p>
                  A area de seguranca continua ligada ao perfil por navegacao simples e direta.
                </p>
              </li>
            </ul>

            <div className="profile-page__hero-actions">
              <Link
                className="profile-page__link profile-page__link--primary"
                to={ROUTE_PATHS.PROFILE_CHANGE_PASSWORD}
              >
                Abrir troca de senha
              </Link>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
