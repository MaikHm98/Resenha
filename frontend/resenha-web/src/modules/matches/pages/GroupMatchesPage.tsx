import { Link, useParams } from 'react-router-dom'
import {
  ROUTE_PATHS,
  buildGroupDetailPath,
} from '../../../app/router/paths'
import { Alert, Button, EmptyState, Spinner } from '../../../shared/components'
import { CreateMatchForm } from '../components/CreateMatchForm'
import { MatchCard } from '../components/MatchCard'
import { useGroupMatchesData } from '../hooks/useGroupMatchesData'
import './GroupMatchesPage.css'

function parseGroupId(value: string | undefined): number | null {
  if (!value) {
    return null
  }

  const parsedValue = Number.parseInt(value, 10)
  return Number.isNaN(parsedValue) ? null : parsedValue
}

export function GroupMatchesPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const currentGroupId = groupId ?? 'sem-id'
  const parsedGroupId = parseGroupId(groupId)
  const {
    matches,
    status,
    error,
    isLoading,
    isRefreshing,
    isCreating,
    refresh,
    createMatch,
    clearError,
  } = useGroupMatchesData(parsedGroupId)

  const hasMatches = matches.length > 0
  const isInitialLoading = status === 'idle' || status === 'loading' || isLoading
  const showFullError = status === 'error' && !hasMatches

  return (
    <section className="group-matches-page" aria-labelledby="group-matches-page-title">
      <header className="group-matches-page__hero">
        <div className="group-matches-page__breadcrumbs">
          <Link to={ROUTE_PATHS.GROUPS}>Grupos</Link>
          <span>/</span>
          <Link to={buildGroupDetailPath(currentGroupId)}>{currentGroupId}</Link>
          <span>/</span>
          <span>matches</span>
        </div>

        <div className="group-matches-page__hero-content">
          <div>
            <p className="group-matches-page__route">
              Rota ativa: /groups/{currentGroupId}/matches
            </p>
            <h1 className="app-title" id="group-matches-page-title">
              Partidas do grupo
            </h1>
            <p className="app-subtitle">
              Consulte as partidas reais deste grupo e crie novas partidas sem
              sair do fluxo ancorado no grupo.
            </p>
          </div>

          <div className="group-matches-page__hero-actions">
            <Link
              className="group-matches-page__link group-matches-page__link--primary"
              to={buildGroupDetailPath(currentGroupId)}
            >
              Voltar para o grupo
            </Link>
            <Link className="group-matches-page__link" to={ROUTE_PATHS.MATCHES}>
              Entrada do modulo
            </Link>
            <Button
              disabled={parsedGroupId === null || isInitialLoading}
              loading={isRefreshing}
              onClick={() => void refresh()}
              type="button"
              variant="secondary"
            >
              Atualizar partidas
            </Button>
          </div>
        </div>
      </header>

      {error && !showFullError ? (
        <div className="group-matches-page__alert-stack">
          <Alert title="Nao foi possivel concluir a acao" variant="warning">
            {error}
          </Alert>
          <div className="group-matches-page__alert-actions">
            <Button onClick={clearError} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      <div className="group-matches-page__content">
        <section
          className="group-matches-page__panel group-matches-page__panel--form"
          aria-labelledby="group-matches-create-title"
        >
          <header className="group-matches-page__panel-header">
            <div>
              <h2 id="group-matches-create-title">Criar partida</h2>
              <p>
                Formulario conectado ao backend para criar uma partida no grupo
                atual e atualizar a listagem da pagina.
              </p>
            </div>
            <span className="group-matches-page__badge">Criacao</span>
          </header>

          {parsedGroupId !== null ? (
            <CreateMatchForm
              groupId={parsedGroupId}
              isSubmitting={isCreating}
              onSubmit={createMatch}
            />
          ) : (
            <section
              className="group-matches-page__state-panel"
              aria-label="Grupo invalido"
            >
              <Alert title="Rota de grupo invalida" variant="error">
                O identificador deste grupo nao e valido para criar partidas.
              </Alert>
              <Link
                className="group-matches-page__link group-matches-page__link--primary"
                to={ROUTE_PATHS.GROUPS}
              >
                Voltar para grupos
              </Link>
            </section>
          )}
        </section>

        <section
          className="group-matches-page__panel group-matches-page__panel--list"
          aria-labelledby="group-matches-list-title"
        >
          <header className="group-matches-page__panel-header">
            <div>
              <h2 id="group-matches-list-title">Partidas do grupo</h2>
              <p>
                Listagem real carregada via `GET /api/groups/{'{'}groupId{'}'}/matches`
                e pronta para levar o usuario ao detalhe da partida.
              </p>
            </div>
            <span className="group-matches-page__badge group-matches-page__badge--outline">
              {matches.length}
            </span>
          </header>

          {isInitialLoading ? (
            <section
              className="group-matches-page__state-panel"
              aria-label="Carregando partidas"
            >
              <Spinner label="Carregando as partidas do grupo..." size="lg" />
            </section>
          ) : null}

          {!isInitialLoading && showFullError ? (
            <section
              className="group-matches-page__state-panel"
              aria-label="Erro ao carregar partidas"
            >
              <Alert title="Nao foi possivel carregar as partidas" variant="error">
                {error ?? 'Tente novamente em alguns instantes.'}
              </Alert>
              <Button onClick={() => void refresh()} type="button">
                Tentar novamente
              </Button>
            </section>
          ) : null}

          {!isInitialLoading && !showFullError ? (
            <>
              {hasMatches ? (
                <ul className="group-matches-page__list">
                  {matches.map((match) => (
                    <MatchCard key={match.idPartida} match={match} />
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title="Nenhuma partida cadastrada"
                  description="Crie a primeira partida deste grupo usando o formulario ao lado."
                />
              )}
            </>
          ) : null}
        </section>
      </div>
    </section>
  )
}
