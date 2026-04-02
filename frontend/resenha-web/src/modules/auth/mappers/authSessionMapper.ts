import type { AuthSession } from '../types/AuthSession'
import type { AuthApiResponse } from '../types/authContracts'

export function mapAuthApiResponseToSession(
  payload: AuthApiResponse,
): AuthSession {
  return {
    accessToken: payload.token,
    userId: String(payload.idUsuario),
    userName: payload.nome,
  }
}
