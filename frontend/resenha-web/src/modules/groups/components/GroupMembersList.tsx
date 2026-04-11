import { useState } from 'react'
import { Alert, Button, EmptyState } from '../../../shared/components'
import {
  GROUP_ROLE_VALUES,
  type GroupMember,
  type GroupRole,
} from '../types/groupsContracts'

type GroupMembersListProps = {
  members: GroupMember[]
  canManageMembers: boolean
  memberActionStateByUserId: Record<
    number,
    {
      isUpdatingRole: boolean
      isRemoving: boolean
      error: string | null
    }
  >
  onUpdateRole: (memberUserId: number, nextRole: GroupRole) => Promise<boolean>
  onRemoveMember: (memberUserId: number) => Promise<boolean>
  onClearMemberActionError: (memberUserId: number) => void
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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function GroupMembersListItem({
  member,
  canManageMembers,
  actionState,
  onUpdateRole,
  onRemoveMember,
  onClearMemberActionError,
}: {
  member: GroupMember
  canManageMembers: boolean
  actionState: {
    isUpdatingRole: boolean
    isRemoving: boolean
    error: string | null
  }
  onUpdateRole: (memberUserId: number, nextRole: GroupRole) => Promise<boolean>
  onRemoveMember: (memberUserId: number) => Promise<boolean>
  onClearMemberActionError: (memberUserId: number) => void
}) {
  const [nextRole, setNextRole] = useState<GroupRole>(member.perfil)

  const isProcessingAction = actionState.isUpdatingRole || actionState.isRemoving
  const canSubmitRoleChange = nextRole !== member.perfil && !isProcessingAction
  const roleFieldId = `group-member-role-${member.idUsuario}`

  return (
    <li className="group-members-list__item">
      <div className="group-members-list__avatar" aria-hidden="true">
        {member.timeCoracaoCodigo
          ? member.timeCoracaoCodigo.slice(0, 3).toUpperCase()
          : getInitials(member.nome)}
      </div>

      <div className="group-members-list__content">
        <div className="group-members-list__header">
          <strong>{member.nome}</strong>
          <span
            className={[
              'group-members-list__role',
              member.perfil === 'ADMIN'
                ? 'group-members-list__role--admin'
                : 'group-members-list__role--player',
            ].join(' ')}
          >
            {member.perfil}
          </span>
        </div>

        <p>{member.email}</p>

        <ul className="group-members-list__meta">
          <li>Entrou em: {formatDate(member.entrouEm)}</li>
          <li>Goleiro: {member.goleiro ? 'Sim' : 'Nao'}</li>
          <li>
            Time do coracao:{' '}
            {member.timeCoracaoNome || member.timeCoracaoCodigo || 'Nao informado'}
          </li>
        </ul>

        {canManageMembers ? (
          <div className="group-members-list__governance">
            <div className="group-members-list__governance-header">
              <strong>Governanca do membro</strong>
              <span>Somente admin</span>
            </div>

            <div className="group-members-list__governance-row">
              <div className="group-members-list__field">
                <label className="ui-input-label" htmlFor={roleFieldId}>
                  Papel
                </label>
                <select
                  className="group-members-list__select"
                  disabled={isProcessingAction}
                  id={roleFieldId}
                  onChange={(event) => {
                    setNextRole(event.target.value as GroupRole)
                    onClearMemberActionError(member.idUsuario)
                  }}
                  value={nextRole}
                >
                  {GROUP_ROLE_VALUES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="group-members-list__actions">
                <Button
                  disabled={!canSubmitRoleChange}
                  loading={actionState.isUpdatingRole}
                  onClick={() => void onUpdateRole(member.idUsuario, nextRole)}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  Salvar papel
                </Button>

                <Button
                  disabled={isProcessingAction}
                  loading={actionState.isRemoving}
                  onClick={() => {
                    const shouldRemoveMember = window.confirm(
                      `Remover ${member.nome} deste grupo? Esta acao depende da validacao do backend e pode impactar a governanca do grupo.`,
                    )

                    if (!shouldRemoveMember) {
                      return
                    }

                    onClearMemberActionError(member.idUsuario)
                    void onRemoveMember(member.idUsuario)
                  }}
                  size="sm"
                  type="button"
                  variant="danger"
                >
                  Remover membro
                </Button>
              </div>
            </div>

            {actionState.error ? (
              <Alert title="Nao foi possivel atualizar este membro" variant="warning">
                {actionState.error}
              </Alert>
            ) : null}
          </div>
        ) : null}
      </div>
    </li>
  )
}

export function GroupMembersList({
  members,
  canManageMembers,
  memberActionStateByUserId,
  onUpdateRole,
  onRemoveMember,
  onClearMemberActionError,
}: GroupMembersListProps) {
  if (members.length === 0) {
    return (
      <EmptyState
        title="Nenhum membro encontrado"
        description="Quando houver membros ativos neste grupo, eles aparecerao aqui."
      />
    )
  }

  return (
    <ul className="group-members-list">
      {members.map((member) => (
        <GroupMembersListItem
          actionState={
            memberActionStateByUserId[member.idUsuario] ?? {
              isUpdatingRole: false,
              isRemoving: false,
              error: null,
            }
          }
          canManageMembers={canManageMembers}
          key={`${member.idUsuario}-${member.perfil}`}
          member={member}
          onClearMemberActionError={onClearMemberActionError}
          onRemoveMember={onRemoveMember}
          onUpdateRole={onUpdateRole}
        />
      ))}
    </ul>
  )
}
