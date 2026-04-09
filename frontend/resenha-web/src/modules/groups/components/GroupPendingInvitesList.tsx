import { Alert, EmptyState } from '../../../shared/components'
import type { GroupPendingInvite } from '../types/groupsContracts'

type GroupPendingInvitesListProps = {
  pendingInvites: GroupPendingInvite[]
  canViewPendingInvites: boolean
  error: string | null
}

function formatDateTime(value: string): string {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsedDate)
}

export function GroupPendingInvitesList({
  pendingInvites,
  canViewPendingInvites,
  error,
}: GroupPendingInvitesListProps) {
  if (!canViewPendingInvites) {
    return (
      <div className="group-pending-invites__notice">
        <p>
          Convites pendentes ficam visiveis apenas para administradores deste
          grupo.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert title="Nao foi possivel carregar convites pendentes" variant="warning">
        {error}
      </Alert>
    )
  }

  if (pendingInvites.length === 0) {
    return (
      <EmptyState
        title="Nenhum convite pendente"
        description="Quando houver convites ativos para este grupo, eles aparecerao aqui."
      />
    )
  }

  return (
    <ul className="group-pending-invites">
      {pendingInvites.map((invite) => (
        <li className="group-pending-invites__item" key={invite.idConvite}>
          <div className="group-pending-invites__header">
            <strong>{invite.emailConvidado}</strong>
            <span className="group-pending-invites__code">
              {invite.codigoConvite}
            </span>
          </div>

          <ul className="group-pending-invites__meta">
            <li>Convite #{invite.idConvite}</li>
            <li>Criado em: {formatDateTime(invite.criadoEm)}</li>
            <li>Expira em: {formatDateTime(invite.expiraEm)}</li>
          </ul>
        </li>
      ))}
    </ul>
  )
}
