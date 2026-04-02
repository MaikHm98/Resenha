import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AuthContext, type AuthContextValue } from './AuthContext'
import {
  clearSessionFromStorage,
  loadSessionFromStorage,
  saveSessionToStorage,
} from '../storage/sessionStorage'
import type { AuthSession } from '../types/AuthSession'
import { authApi } from '../api/authApi'
import { mapAuthApiResponseToSession } from '../mappers/authSessionMapper'
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '../types/authContracts'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(() =>
    loadSessionFromStorage(),
  )

  const persistSession = useCallback((nextSession: AuthSession) => {
    setSession(nextSession)
    saveSessionToStorage(nextSession)
  }, [])

  const clearPersistedSession = useCallback(() => {
    setSession(null)
    clearSessionFromStorage()
  }, [])

  const login = useCallback(
    async (payload: LoginRequest): Promise<AuthSession> => {
      const response = await authApi.login(payload)
      const mappedSession = mapAuthApiResponseToSession(response)
      persistSession(mappedSession)
      return mappedSession
    },
    [persistSession],
  )

  const register = useCallback(
    async (payload: RegisterRequest): Promise<AuthSession> => {
      const response = await authApi.register(payload)
      const mappedSession = mapAuthApiResponseToSession(response)
      persistSession(mappedSession)
      return mappedSession
    },
    [persistSession],
  )

  const logout = useCallback(() => {
    clearPersistedSession()
  }, [clearPersistedSession])

  const forgotPassword = useCallback(
    async (
      payload: ForgotPasswordRequest,
    ): Promise<ForgotPasswordResponse> => authApi.forgotPassword(payload),
    [],
  )

  const validateResetToken = useCallback(
    async (token: string): Promise<boolean> => {
      const response = await authApi.validateResetToken(token)
      return response.valido
    },
    [],
  )

  const resetPassword = useCallback(
    async (payload: ResetPasswordRequest): Promise<ResetPasswordResponse> =>
      authApi.resetPassword(payload),
    [],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      login,
      register,
      logout,
      forgotPassword,
      validateResetToken,
      resetPassword,
    }),
    [
      forgotPassword,
      login,
      logout,
      register,
      resetPassword,
      session,
      validateResetToken,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
