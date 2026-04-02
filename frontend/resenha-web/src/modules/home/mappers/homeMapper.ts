import type {
  HomeGroup,
  HomeGroupApiResponse,
  HomePendingInvite,
  PendingInviteApiResponse,
  RejectInviteApiResponse,
  RejectInviteResult,
} from '../types/homeContracts'

export function mapHomeGroupApiToHomeGroup(
  payload: HomeGroupApiResponse,
): HomeGroup {
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

export function mapPendingInviteApiToPendingInvite(
  payload: PendingInviteApiResponse,
): HomePendingInvite {
  return {
    idConvite: payload.idConvite,
    idGrupo: payload.idGrupo,
    nomeGrupo: payload.nomeGrupo,
    codigoConvite: payload.codigoConvite,
    expiraEm: payload.expiraEm,
    criadoEm: payload.criadoEm,
  }
}

export function mapRejectInviteApiToResult(
  payload: RejectInviteApiResponse,
): RejectInviteResult {
  return {
    mensagem: payload.mensagem,
  }
}
