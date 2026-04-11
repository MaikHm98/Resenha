import type { AuthSession } from '../types/AuthSession'
import type { AuthApiResponse } from '../types/authContracts'

export function mapAuthApiResponseToSession(
  payload: AuthApiResponse,
  currentSession?: AuthSession | null,
): AuthSession {
  const nextAccessToken =
    payload.token.trim().length > 0
      ? payload.token
      : currentSession?.accessToken ?? ''

  return {
    accessToken: nextAccessToken,
    userId: String(payload.idUsuario),
    userName: payload.nome,
    userEmail: payload.email,
    goleiro: payload.goleiro,
    timeCoracaoCodigo: payload.timeCoracaoCodigo,
    timeCoracaoNome: payload.timeCoracaoNome,
    timeCoracaoEscudoUrl: payload.timeCoracaoEscudoUrl,
    posicaoPrincipal: payload.posicaoPrincipal,
    peDominante: payload.peDominante,
  }
}
