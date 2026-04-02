export type HomeGroupApiResponse = {
  idGrupo: number
  nome: string
  descricao: string | null
  limiteJogadores: number
  perfil: string
  totalMembros: number
  criadoEm: string
  diaSemana: number | null
  horarioFixo: string | null
}

export type PendingInviteApiResponse = {
  idConvite: number
  idGrupo: number
  nomeGrupo: string
  codigoConvite: string
  expiraEm: string
  criadoEm: string
}

export type RejectInviteApiResponse = {
  mensagem: string
}

export type HomeGroup = {
  idGrupo: number
  nome: string
  descricao: string | null
  limiteJogadores: number
  perfil: string
  totalMembros: number
  criadoEm: string
  diaSemana: number | null
  horarioFixo: string | null
}

export type HomePendingInvite = {
  idConvite: number
  idGrupo: number
  nomeGrupo: string
  codigoConvite: string
  expiraEm: string
  criadoEm: string
}

export type RejectInviteResult = {
  mensagem: string
}
