import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ROUTE_PATHS,
  buildGroupCaptainPath,
  buildGroupClassificationPath,
  buildGroupDetailPath,
  buildGroupMatchesPath,
} from '../../../app/router/paths'
import { Alert, Button, Spinner } from '../../../shared/components'
import { DeleteGroupSection } from '../components/DeleteGroupSection'
import { GroupMembersList } from '../components/GroupMembersList'
import { GroupOverviewPanel } from '../components/GroupOverviewPanel'
import { GroupPendingInvitesList } from '../components/GroupPendingInvitesList'
import { GroupScheduleForm } from '../components/GroupScheduleForm'
import { InviteMemberForm } from '../components/InviteMemberForm'
import { useGroupGovernanceData } from '../hooks/useGroupGovernanceData'
import './GroupDetailPage.css'

function parseGroupId(value: string | undefined): number | null {
  if (!value) {
    return null
  }

  const parsedValue = Number.parseInt(value, 10)
  return Number.isNaN(parsedValue) ? null : parsedValue
}

export function GroupDetailPage() {
  const navigate = useNavigate()
  const { groupId } = useParams<{ groupId: string }>()
  const currentGroupId = groupId ?? 'sem-id'
  const parsedGroupId = parseGroupId(groupId)
  const {
    group,
    members,
    pendingInvites,
    status,
    error,
    pendingInvitesError,
    inviteError,
    inviteResult,
    memberActionNotice,
    memberActionStateByUserId,
    scheduleError,
    scheduleNotice,
    deleteGroupError,
    isLoading,
    isRefreshing,
    isInvitingMember,
    isUpdatingSchedule,
    isDeletingGroup,
    canViewPendingInvites,
    refresh,
    inviteMember,
    updateMemberRole,
    removeMember,
    updateSchedule,
    deleteGroup,
    clearError,
    clearInviteFeedback,
    clearMemberActionError,
    clearMemberActionNotice,
    clearScheduleFeedback,
    clearDeleteGroupFeedback,
  } = useGroupGovernanceData(parsedGroupId)

  const isInitialLoading = status === 'idle' || status === 'loading' || isLoading
  const showFullError = status === 'error' && !group

  return (
    <section className="group-detail-page" aria-labelledby="group-detail-page-title">
      <header className="group-detail-page__hero">
        <div className="group-detail-page__breadcrumbs">
          <Link to={ROUTE_PATHS.GROUPS}>Grupos</Link>
          <span>/</span>
          <span>{currentGroupId}</span>
        </div>

        <div className="group-detail-page__hero-content">
          <div>
            <p className="group-detail-page__route">
              Rota ativa: {buildGroupDetailPath(currentGroupId)}
            </p>
            <h1 className="app-title" id="group-detail-page-title">
              {group?.nome ?? 'Detalhe do grupo'}
            </h1>
            <p className="app-subtitle">
              Overview do grupo, governanca de membros, agenda e exclusao
              logica com o backend como fonte de verdade.
            </p>
          </div>

          <div className="group-detail-page__hero-actions">
            <Link className="group-detail-page__back-link" to={ROUTE_PATHS.GROUPS}>
              Voltar para grupos
            </Link>
            <Link
              className="group-detail-page__back-link"
              to={buildGroupCaptainPath(currentGroupId)}
            >
              Abrir fluxo de capitao
            </Link>
            <Link
              className="group-detail-page__back-link"
              to={buildGroupClassificationPath(currentGroupId)}
            >
              Ver classificacao do grupo
            </Link>
            <Link
              className="group-detail-page__back-link"
              to={buildGroupMatchesPath(currentGroupId)}
            >
              Ver partidas do grupo
            </Link>
            <Button
              disabled={isInitialLoading}
              loading={isRefreshing}
              onClick={() => void refresh()}
              type="button"
              variant="secondary"
            >
              Atualizar detalhe
            </Button>
          </div>
        </div>
      </header>

      {error && !showFullError ? (
        <div className="group-detail-page__alert-stack">
          <Alert title="Nao foi possivel concluir a atualizacao" variant="warning">
            {error}
          </Alert>
          <div className="group-detail-page__alert-actions">
            <Button onClick={clearError} type="button" variant="secondary">
              Fechar aviso
            </Button>
          </div>
        </div>
      ) : null}

      {isInitialLoading ? (
        <section className="group-detail-page__state-panel" aria-label="Carregando grupo">
          <Spinner label="Carregando dados do grupo..." size="lg" />
        </section>
      ) : null}

      {!isInitialLoading && showFullError ? (
        <section className="group-detail-page__state-panel" aria-label="Erro ao carregar grupo">
          <Alert title="Nao foi possivel carregar este grupo" variant="error">
            {error ?? 'Tente novamente em alguns instantes.'}
          </Alert>
          <div className="group-detail-page__state-actions">
            <Button onClick={() => void refresh()} type="button">
              Tentar novamente
            </Button>
            <Link className="group-detail-page__back-link" to={ROUTE_PATHS.GROUPS}>
              Voltar para grupos
            </Link>
          </div>
        </section>
      ) : null}

      {!isInitialLoading && !showFullError && group ? (
        <div className="group-detail-page__content">
          <section
            className="group-detail-page__panel group-detail-page__panel--overview"
            aria-labelledby="group-overview-title"
          >
            <header className="group-detail-page__panel-header">
              <div>
                <h2 id="group-overview-title">Overview do grupo</h2>
                <p>Resumo do grupo derivado de `GET /api/groups/me`.</p>
              </div>
              <span className="group-detail-page__badge">{group.perfil}</span>
            </header>

            <GroupOverviewPanel group={group} />
          </section>

          <section
            className="group-detail-page__panel group-detail-page__panel--members"
            aria-labelledby="group-members-title"
          >
            <header className="group-detail-page__panel-header">
              <div>
                <h2 id="group-members-title">Membros</h2>
                <p>
                  Lista do grupo com acoes iniciais de governanca restritas ao
                  admin.
                </p>
              </div>
              <span className="group-detail-page__badge group-detail-page__badge--outline">
                {members.length}
              </span>
            </header>

            {memberActionNotice ? (
              <div className="group-detail-page__member-feedback">
                <Alert title="Governanca atualizada" variant="success">
                  {memberActionNotice}
                </Alert>
                <div className="group-detail-page__alert-actions">
                  <Button
                    onClick={clearMemberActionNotice}
                    type="button"
                    variant="secondary"
                  >
                    Fechar aviso
                  </Button>
                </div>
              </div>
            ) : null}

            <GroupMembersList
              canManageMembers={canViewPendingInvites}
              memberActionStateByUserId={memberActionStateByUserId}
              members={members}
              onClearMemberActionError={clearMemberActionError}
              onRemoveMember={removeMember}
              onUpdateRole={updateMemberRole}
            />
          </section>

          {canViewPendingInvites ? (
            <section
              className="group-detail-page__panel group-detail-page__panel--schedule"
              aria-labelledby="group-schedule-title"
            >
              <header className="group-detail-page__panel-header">
                <div>
                  <h2 id="group-schedule-title">Agenda do grupo</h2>
                  <p>
                    Ajuste simples de dia e horario fixo, restrito ao fluxo de
                    admin.
                  </p>
                </div>
                <span className="group-detail-page__badge group-detail-page__badge--outline">
                  Admin
                </span>
              </header>

              <GroupScheduleForm
                error={scheduleError}
                initialDayOfWeek={group.diaSemana}
                initialFixedTime={group.horarioFixo}
                isSubmitting={isUpdatingSchedule}
                key={`${group.idGrupo}-${group.diaSemana ?? 'null'}-${group.horarioFixo ?? 'null'}`}
                notice={scheduleNotice}
                onClearFeedback={clearScheduleFeedback}
                onSubmit={updateSchedule}
              />
            </section>
          ) : null}

          <section
            className="group-detail-page__panel group-detail-page__panel--invites"
            aria-labelledby="group-pending-invites-title"
          >
            <header className="group-detail-page__panel-header">
              <div>
                <h2 id="group-pending-invites-title">Convites pendentes</h2>
                <p>
                  Visao em leitura preparada para receber as acoes de governanca
                  nos proximos commits.
                </p>
              </div>
              <span className="group-detail-page__badge group-detail-page__badge--outline">
                {canViewPendingInvites ? pendingInvites.length : 'Somente admin'}
              </span>
            </header>

            {canViewPendingInvites ? (
              <div className="group-detail-page__invite-stack">
                <div className="group-detail-page__invite-box">
                  <div className="group-detail-page__invite-box-header">
                    <h3>Convidar membro por e-mail</h3>
                    <p>
                      Acao de governanca em modo simples, com refresh apos
                      sucesso e retorno fiel ao backend.
                    </p>
                  </div>

                  <InviteMemberForm
                    inviteError={inviteError}
                    inviteResult={inviteResult}
                    isSubmitting={isInvitingMember}
                    onClearFeedback={clearInviteFeedback}
                    onSubmit={inviteMember}
                  />
                </div>
              </div>
            ) : null}

            <GroupPendingInvitesList
              canViewPendingInvites={canViewPendingInvites}
              error={pendingInvitesError}
              pendingInvites={pendingInvites}
            />
          </section>

          {canViewPendingInvites ? (
            <section
              className="group-detail-page__panel group-detail-page__panel--danger"
              aria-labelledby="group-delete-title"
            >
              <header className="group-detail-page__panel-header">
                <div>
                  <h2 id="group-delete-title">Excluir grupo</h2>
                  <p>
                    Exclusao logica com confirmacao explicita antes de voltar
                    para a listagem de grupos.
                  </p>
                </div>
                <span className="group-detail-page__badge group-detail-page__badge--danger">
                  Acao sensivel
                </span>
              </header>

              <DeleteGroupSection
                error={deleteGroupError}
                groupName={group.nome}
                isSubmitting={isDeletingGroup}
                onClearFeedback={clearDeleteGroupFeedback}
                onConfirmDelete={async () => {
                  const didDelete = await deleteGroup()

                  if (didDelete) {
                    navigate(ROUTE_PATHS.GROUPS, { replace: true })
                  }

                  return didDelete
                }}
              />
            </section>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
