export type AuthSession = {
  accessToken: string
  userId: string
  userName: string
  userEmail: string | null
  goleiro: boolean | null
  timeCoracaoCodigo: string | null
  timeCoracaoNome: string | null
  timeCoracaoEscudoUrl: string | null
  posicaoPrincipal: string | null
  peDominante: string | null
}

export function isAuthSessionUsable(
  session: AuthSession | null | undefined,
): session is AuthSession {
  if (!session) {
    return false
  }

  return (
    session.accessToken.trim().length > 0 &&
    session.userId.trim().length > 0 &&
    session.userName.trim().length > 0
  )
}
