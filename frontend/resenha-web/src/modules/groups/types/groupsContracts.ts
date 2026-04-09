export const GROUP_ROLE_VALUES = ['ADMIN', 'JOGADOR'] as const
export type GroupRole = (typeof GROUP_ROLE_VALUES)[number]

export const GROUP_INVITE_STATUS_VALUES = [
  'PENDENTE',
  'ACEITO',
  'EXPIRADO',
  'CANCELADO',
] as const
export type GroupInviteStatus = (typeof GROUP_INVITE_STATUS_VALUES)[number]

export const ADD_GROUP_MEMBER_ACTION_VALUES = ['ADDED', 'INVITED'] as const
export type AddGroupMemberAction =
  (typeof ADD_GROUP_MEMBER_ACTION_VALUES)[number]

export type GroupWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type GroupApiResponse = {
  idGrupo: number
  nome: string
  descricao: string | null
  limiteJogadores: number
  perfil: GroupRole
  totalMembros: number
  criadoEm: string
  diaSemana: GroupWeekday | null
  horarioFixo: string | null
}

export type GroupMemberApiResponse = {
  idUsuario: number
  nome: string
  email: string
  perfil: GroupRole
  goleiro: boolean
  timeCoracaoCodigo: string | null
  timeCoracaoNome: string | null
  timeCoracaoEscudoUrl: string | null
  entrouEm: string
}

export type GroupPendingInviteApiResponse = {
  idConvite: number
  emailConvidado: string
  codigoConvite: string
  inviteLink: string
  expiraEm: string
  criadoEm: string
}

export type AddGroupMemberResultApiResponse = {
  acao: AddGroupMemberAction
  mensagem: string
  membro?: GroupMemberApiResponse | null
  codigoConvite?: string | null
  inviteLink?: string | null
  expiraEm?: string | null
}

export type MessageApiResponse = {
  mensagem: string
}

export type CreateGroupInput = {
  nome: string
  descricao?: string | null
  limiteJogadores: number
  diaSemana?: GroupWeekday | null
  horarioFixo?: string | null
}

export type AddGroupMemberInput = {
  email: string
}

export type UpdateGroupMemberRoleInput = {
  perfil: GroupRole
}

export type UpdateGroupScheduleInput = {
  diaSemana: GroupWeekday | null
  horarioFixo: string | null
}

export type Group = {
  idGrupo: number
  nome: string
  descricao: string | null
  limiteJogadores: number
  perfil: GroupRole
  totalMembros: number
  criadoEm: string
  diaSemana: GroupWeekday | null
  horarioFixo: string | null
}

export type GroupMember = {
  idUsuario: number
  nome: string
  email: string
  perfil: GroupRole
  goleiro: boolean
  timeCoracaoCodigo: string | null
  timeCoracaoNome: string | null
  timeCoracaoEscudoUrl: string | null
  entrouEm: string
}

export type GroupPendingInvite = {
  idConvite: number
  emailConvidado: string
  codigoConvite: string
  inviteLink: string
  expiraEm: string
  criadoEm: string
}

export type AddGroupMemberResult = {
  acao: AddGroupMemberAction
  mensagem: string
  membro?: GroupMember
  codigoConvite?: string | null
  inviteLink?: string | null
  expiraEm?: string | null
}

export type MessageResult = {
  mensagem: string
}
