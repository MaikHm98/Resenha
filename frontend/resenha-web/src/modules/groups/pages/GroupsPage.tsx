import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '../../../app/router/paths'
import { Alert, Button, EmptyState, Spinner } from '../../../shared/components'
import { CreateGroupForm } from '../components/CreateGroupForm'
import { GroupCard } from '../components/GroupCard'
import { useGroupsListData } from '../hooks/useGroupsListData'
import './GroupsPage.css'

export function GroupsPage() {
  const {
    groups,
    status,
    error,
    isLoading,
    isRefreshing,
    isCreating,
    refresh,
    createGroup,
    clearError,
  } = useGroupsListData()

  const hasGroups = groups.length > 0
  const isInitialLoading = status === 'idle' || status === 'loading' || isLoading
  const showFullError = status === 'error' && !hasGroups

  return (
    <section className="groups-page" aria-labelledby="groups-page-title">
      <header className="groups-page__hero">
        <div className="groups-page__eyebrow">Modulo de grupos</div>
        <div className="groups-page__hero-content">
          <div>
            <p className="groups-page__route">Rota base: {ROUTE_PATHS.GROUPS}</p>
            <h1 className="app-title" id="groups-page-title">
              Grupos e governanca
            </h1>
            <p className="app-subtitle">
              Veja onde voce joga e abra novos grupos sem sair da resenha.
            </p>
          </div>

          <div className="groups-page__hero-actions">
            <Link
              className="groups-page__link groups-page__link--primary"
              to={ROUTE_PATHS.HOME}
            >
              Voltar para Home
            </Link>
            <Button
              disabled={isInitialLoading}
              loading={isRefreshing}
              onClick={() => void refresh()}
              type="button"
              variant="secondary"
            >
              Atualizar grupos
            </Button>
          </div>
        </div>
      </header>

      {error && !showFullError ? (
        <div className="groups-page__alert-stack">
          <Alert title="Nao foi possivel concluir a acao" variant="warning">
            {error}
          </Alert>
          <div className="groups-page__alert-actions">
            <Button onClick={clearError} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      <div className="groups-page__content">
        <section
          className="groups-page__panel groups-page__panel--form"
          aria-labelledby="groups-create-title"
          id="groups-create-panel"
        >
          <header className="groups-page__panel-header">
            <div>
                <h2 id="groups-create-title">Criar grupo</h2>
                <p>
                  Monte um novo grupo com agenda e limite de jogadores em poucos passos.
                </p>
              </div>
            <span className="groups-page__badge">Criacao</span>
          </header>

          <CreateGroupForm isSubmitting={isCreating} onSubmit={createGroup} />
        </section>

        <section
          className="groups-page__panel groups-page__panel--list"
          aria-labelledby="groups-list-title"
        >
          <header className="groups-page__panel-header">
            <div>
                <h2 id="groups-list-title">Seus grupos</h2>
                <p>
                  Seus grupos ativos aparecem aqui para voce entrar direto na organizacao da partida.
                </p>
              </div>
            <span className="groups-page__badge groups-page__badge--outline">
              {groups.length}
            </span>
          </header>

          {isInitialLoading ? (
            <section className="groups-page__state-panel" aria-label="Carregando grupos">
              <Spinner label="Carregando seus grupos..." size="lg" />
            </section>
          ) : null}

          {!isInitialLoading && showFullError ? (
            <section className="groups-page__state-panel" aria-label="Erro ao carregar grupos">
              <Alert title="Nao foi possivel carregar seus grupos" variant="error">
                {error ?? 'Tente novamente em alguns instantes.'}
              </Alert>
              <Button onClick={() => void refresh()} type="button">
                Tentar novamente
              </Button>
            </section>
          ) : null}

          {!isInitialLoading && !showFullError ? (
            <>
              {hasGroups ? (
                <ul className="groups-page__list">
                  {groups.map((group) => (
                    <GroupCard group={group} key={group.idGrupo} />
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title="Voce ainda nao participa de grupos"
                  description="Crie seu primeiro grupo para organizar a proxima resenha."
                />
              )}
            </>
          ) : null}
        </section>
      </div>
    </section>
  )
}
