import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../../../app/router/paths'
import { Alert, Button, EmptyState, Spinner } from '../../../shared/components'
import { useHomeData } from '../hooks/useHomeData'
import type { HomeGroup, HomePendingInvite } from '../types/homeContracts'
import './HomePage.css'

const WEEKDAY_LABELS: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terca-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sabado',
}

function formatDate(value: string): string {
  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsedDate)
}

function getWeekdayLabel(dayOfWeek: number | null): string {
  if (dayOfWeek === null) {
    return 'Nao definido'
  }

  return WEEKDAY_LABELS[dayOfWeek] ?? 'Nao definido'
}

function getScheduleLabel(
  dayOfWeek: number | null,
  fixedTime: string | null,
): string {
  const weekdayLabel = getWeekdayLabel(dayOfWeek)
  const timeLabel = fixedTime ?? 'Horario nao definido'
  return `${weekdayLabel} - ${timeLabel}`
}

type HomeGroupCardProps = {
  group: HomeGroup
}

function HomeGroupCard({ group }: HomeGroupCardProps) {
  return (
    <li className="home-list-item">
      <header className="home-list-item__header">
        <h3 className="home-list-item__title">{group.nome}</h3>
        <span className="home-list-item__meta">
          {group.totalMembros}/{group.limiteJogadores} membros
        </span>
      </header>

      <p className="home-list-item__description">
        {group.descricao || 'Grupo sem descricao cadastrada.'}
      </p>

      <ul className="home-list-item__details" aria-label={`Detalhes do grupo ${group.nome}`}>
        <li>Perfil: {group.perfil}</li>
        <li>Agenda: {getScheduleLabel(group.diaSemana, group.horarioFixo)}</li>
        <li>Criado em: {formatDate(group.criadoEm)}</li>
      </ul>
    </li>
  )
}

type HomeInviteCardProps = {
  invite: HomePendingInvite
  isActionLoading: boolean
  actionInFlight: InviteActionType | null
  onAcceptInvite: (inviteId: number) => void
  onRejectInvite: (inviteId: number) => void
}

type InviteActionType = 'accept' | 'reject'

function HomeInviteCard({
  invite,
  isActionLoading,
  actionInFlight,
  onAcceptInvite,
  onRejectInvite,
}: HomeInviteCardProps) {
  return (
    <li className="home-list-item">
      <header className="home-list-item__header">
        <h3 className="home-list-item__title">{invite.nomeGrupo}</h3>
        <span className="home-list-item__meta">Convite #{invite.idConvite}</span>
      </header>

      <ul
        className="home-list-item__details"
        aria-label={`Detalhes do convite para ${invite.nomeGrupo}`}
      >
        <li>Codigo: {invite.codigoConvite}</li>
        <li>Recebido em: {formatDate(invite.criadoEm)}</li>
        <li>Expira em: {formatDate(invite.expiraEm)}</li>
      </ul>

      <div className="home-invite-actions">
        <Button
          disabled={isActionLoading}
          loading={isActionLoading && actionInFlight === 'accept'}
          onClick={() => onAcceptInvite(invite.idConvite)}
          type="button"
        >
          Aceitar convite
        </Button>
        <Button
          disabled={isActionLoading}
          loading={isActionLoading && actionInFlight === 'reject'}
          onClick={() => onRejectInvite(invite.idConvite)}
          type="button"
          variant="danger"
        >
          Recusar convite
        </Button>
      </div>

      {isActionLoading ? (
        <span className="home-invite-actions__status">
          <Spinner label="Processando convite..." size="sm" />
        </span>
      ) : null}
    </li>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const [inviteActionById, setInviteActionById] = useState<
    Record<number, InviteActionType>
  >({})
  const {
    groups,
    pendingInvites,
    status,
    error,
    isLoading,
    isRefreshing,
    refresh,
    clearError,
    acceptInvite,
    rejectInvite,
    isInviteActionLoading,
  } = useHomeData()

  const hasGroups = groups.length > 0
  const hasPendingInvites = pendingInvites.length > 0
  const hasAnyData = hasGroups || hasPendingInvites
  const isInitialLoading = status === 'idle' || status === 'loading' || isLoading
  const showFullError = status === 'error' && !hasAnyData

  const clearInviteAction = useCallback((inviteId: number) => {
    setInviteActionById((current) => {
      if (!(inviteId in current)) {
        return current
      }

      const next = { ...current }
      delete next[inviteId]
      return next
    })
  }, [])

  const handleAcceptInvite = useCallback(
    async (inviteId: number) => {
      if (isInviteActionLoading(inviteId)) {
        return
      }

      setInviteActionById((current) => ({ ...current, [inviteId]: 'accept' }))

      try {
        await acceptInvite(inviteId)
      } finally {
        clearInviteAction(inviteId)
      }
    },
    [acceptInvite, clearInviteAction, isInviteActionLoading],
  )

  const handleRejectInvite = useCallback(
    async (inviteId: number) => {
      if (isInviteActionLoading(inviteId)) {
        return
      }

      setInviteActionById((current) => ({ ...current, [inviteId]: 'reject' }))

      try {
        await rejectInvite(inviteId)
      } finally {
        clearInviteAction(inviteId)
      }
    },
    [clearInviteAction, isInviteActionLoading, rejectInvite],
  )

  return (
    <section className="home-page" aria-labelledby="home-page-title">
      <header className="home-page__header">
        <div>
          <h1 className="app-title" id="home-page-title">
            Home
          </h1>
          <p className="app-subtitle">
            Veja seus grupos e os convites pendentes em um unico lugar.
          </p>
        </div>

        <div className="home-page__header-actions">
          <Button
            disabled={isInitialLoading}
            loading={isRefreshing}
            onClick={() => void refresh()}
            type="button"
            variant="secondary"
          >
            Atualizar
          </Button>
        </div>
      </header>

      <nav className="home-page__quick-links" aria-label="Atalhos principais">
        <Button onClick={() => navigate(ROUTE_PATHS.GROUPS)} type="button" variant="secondary">
          Ir para grupos
        </Button>
        <Button onClick={() => navigate(ROUTE_PATHS.MATCHES)} type="button" variant="secondary">
          Ir para partidas
        </Button>
        <Button onClick={() => navigate(ROUTE_PATHS.PROFILE)} type="button" variant="secondary">
          Ir para perfil
        </Button>
      </nav>

      {isInitialLoading ? (
        <section className="home-state-panel" aria-label="Carregando dados da Home">
          <Spinner label="Carregando grupos e convites..." size="lg" />
        </section>
      ) : null}

      {!isInitialLoading && showFullError ? (
        <section className="home-state-panel" aria-label="Erro ao carregar Home">
          <Alert title="Nao foi possivel carregar a Home" variant="error">
            {error ?? 'Tente atualizar novamente em alguns instantes.'}
          </Alert>
          <Button onClick={() => void refresh()} type="button">
            Tentar novamente
          </Button>
        </section>
      ) : null}

      {!isInitialLoading && !showFullError ? (
        <section className="home-content" aria-label="Conteudo da Home">
          {error ? (
            <Alert title="Falha na ultima atualizacao" variant="warning">
              {error}
            </Alert>
          ) : null}

          <section className="home-panel" aria-labelledby="home-groups-title">
            <header className="home-panel__header">
              <h2 id="home-groups-title">Seus grupos</h2>
              <span>{groups.length}</span>
            </header>

            {hasGroups ? (
              <ul className="home-list">
                {groups.map((group) => (
                  <HomeGroupCard group={group} key={group.idGrupo} />
                ))}
              </ul>
            ) : (
              <EmptyState
                title="Voce ainda nao participa de grupos"
                description="Quando entrar em um grupo, ele aparecera aqui."
                action={
                  <Button
                    onClick={() => navigate(ROUTE_PATHS.GROUPS)}
                    type="button"
                    variant="secondary"
                  >
                    Ver modulo de grupos
                  </Button>
                }
              />
            )}
          </section>

          <section className="home-panel" aria-labelledby="home-invites-title">
            <header className="home-panel__header">
              <h2 id="home-invites-title">Convites pendentes</h2>
              <span>{pendingInvites.length}</span>
            </header>

            {hasPendingInvites ? (
              <ul className="home-list">
                {pendingInvites.map((invite) => (
                  <HomeInviteCard
                    actionInFlight={inviteActionById[invite.idConvite] ?? null}
                    invite={invite}
                    isActionLoading={isInviteActionLoading(invite.idConvite)}
                    key={invite.idConvite}
                    onAcceptInvite={(inviteId) => void handleAcceptInvite(inviteId)}
                    onRejectInvite={(inviteId) => void handleRejectInvite(inviteId)}
                  />
                ))}
              </ul>
            ) : (
              <EmptyState
                title="Nenhum convite pendente"
                description="Os convites para grupos aparecem aqui quando estiverem disponiveis."
              />
            )}
          </section>

          {!error && !hasAnyData ? (
            <section className="home-state-inline">
              <EmptyState
                title="Sua Home esta vazia por enquanto"
                description="Use os atalhos acima para explorar os proximos modulos."
              />
            </section>
          ) : null}

          {error ? (
            <div className="home-error-actions">
              <Button onClick={clearError} type="button" variant="secondary">
                Fechar aviso
              </Button>
            </div>
          ) : null}
        </section>
      ) : null}
    </section>
  )
}
