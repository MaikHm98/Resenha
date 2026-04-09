import type {
  AddGroupMemberResult,
  AddGroupMemberResultApiResponse,
  Group,
  GroupApiResponse,
  GroupMember,
  GroupMemberApiResponse,
  GroupPendingInvite,
  GroupPendingInviteApiResponse,
  MessageApiResponse,
  MessageResult,
} from '../types/groupsContracts'

export function mapGroupApiToGroup(payload: GroupApiResponse): Group {
  return {
    idGrupo: payload.idGrupo,
    nome: payload.nome,
    descricao: payload.descricao,
    limiteJogadores: payload.limiteJogadores,
    perfil: payload.perfil,
    totalMembros: payload.totalMembros,
    criadoEm: payload.criadoEm,
    diaSemana: payload.diaSemana,
    horarioFixo: payload.horarioFixo,
  }
}

export function mapGroupMemberApiToGroupMember(
  payload: GroupMemberApiResponse,
): GroupMember {
  return {
    idUsuario: payload.idUsuario,
    nome: payload.nome,
    email: payload.email,
    perfil: payload.perfil,
    goleiro: payload.goleiro,
    timeCoracaoCodigo: payload.timeCoracaoCodigo,
    timeCoracaoNome: payload.timeCoracaoNome,
    timeCoracaoEscudoUrl: payload.timeCoracaoEscudoUrl,
    entrouEm: payload.entrouEm,
  }
}

export function mapGroupPendingInviteApiToGroupPendingInvite(
  payload: GroupPendingInviteApiResponse,
): GroupPendingInvite {
  return {
    idConvite: payload.idConvite,
    emailConvidado: payload.emailConvidado,
    codigoConvite: payload.codigoConvite,
    inviteLink: payload.inviteLink,
    expiraEm: payload.expiraEm,
    criadoEm: payload.criadoEm,
  }
}

export function mapAddGroupMemberResultApiToAddGroupMemberResult(
  payload: AddGroupMemberResultApiResponse,
): AddGroupMemberResult {
  return {
    acao: payload.acao,
    mensagem: payload.mensagem,
    membro: payload.membro
      ? mapGroupMemberApiToGroupMember(payload.membro)
      : undefined,
    codigoConvite: payload.codigoConvite,
    inviteLink: payload.inviteLink,
    expiraEm: payload.expiraEm,
  }
}

export function mapMessageApiToMessageResult(
  payload: MessageApiResponse,
): MessageResult {
  return {
    mensagem: payload.mensagem,
  }
}
