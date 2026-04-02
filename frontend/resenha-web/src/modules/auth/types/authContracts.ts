export type AuthApiResponse = {
  token: string
  idUsuario: number
  nome: string
  email: string
  goleiro: boolean
  timeCoracaoCodigo: string | null
  timeCoracaoNome: string | null
  timeCoracaoEscudoUrl: string | null
  posicaoPrincipal: string | null
  peDominante: string | null
}

export type LoginRequest = {
  email: string
  senha: string
}

export type RegisterRequest = {
  nome: string
  email: string
  senha: string
  goleiro?: boolean
  timeCoracaoCodigo?: string | null
  posicaoPrincipal: string
  peDominante: string
}

export type ForgotPasswordRequest = {
  email: string
}

export type ForgotPasswordResponse = {
  mensagem: string
  debugToken?: string
}

export type ValidateResetTokenResponse = {
  valido: boolean
}

export type ResetPasswordRequest = {
  token: string
  novaSenha: string
}

export type ResetPasswordResponse = {
  mensagem: string
}
