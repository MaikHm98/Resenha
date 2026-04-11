import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AuthContext, type AuthContextValue } from './AuthContext'
import {
  clearSessionFromStorage,
  loadSessionFromStorage,
  saveSessionToStorage,
  subscribeToSessionInvalidation,
} from '../storage/sessionStorage'
import {
  type AuthSession,
  isAuthSessionUsable,
} from '../types/AuthSession'
import { authApi } from '../api/authApi'
import { mapAuthApiResponseToSession } from '../mappers/authSessionMapper'
import type {
  ChangePasswordRequest,
  ClubOption,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UpdateProfileRequest,
} from '../types/authContracts'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(() =>
    loadSessionFromStorage(),
  )

  const clearPersistedSession = useCallback(() => {
    setSession(null)
    clearSessionFromStorage()
  }, [])

  const persistSession = useCallback(
    (nextSession: AuthSession) => {
      if (!isAuthSessionUsable(nextSession)) {
        clearPersistedSession()
        return
      }

      setSession(nextSession)
      saveSessionToStorage(nextSession)
    },
    [clearPersistedSession],
  )

  useEffect(
    () =>
      subscribeToSessionInvalidation(() => {
        clearPersistedSession()
      }),
    [clearPersistedSession],
  )

  const persistAuthSession = useCallback(
    (payload: Parameters<typeof mapAuthApiResponseToSession>[0]) => {
      const mappedSession = mapAuthApiResponseToSession(payload, session)
      persistSession(mappedSession)
      return mappedSession
    },
    [persistSession, session],
  )

  const login = useCallback(
    async (payload: LoginRequest): Promise<AuthSession> => {
      const response = await authApi.login(payload)
      return persistAuthSession(response)
    },
    [persistAuthSession],
  )

  const register = useCallback(
    async (payload: RegisterRequest): Promise<AuthSession> => {
      const response = await authApi.register(payload)
      return persistAuthSession(response)
    },
    [persistAuthSession],
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

  const getClubOptions = useCallback(
    async (): Promise<ClubOption[]> => authApi.getClubOptions(),
    [],
  )

  const updateProfile = useCallback(
    async (payload: UpdateProfileRequest): Promise<AuthSession> => {
      const response = await authApi.updateProfile(payload)
      return persistAuthSession(response)
    },
    [persistAuthSession],
  )

  const changePassword = useCallback(
    async (payload: ChangePasswordRequest): Promise<AuthSession> => {
      const response = await authApi.changePassword(payload)
      return persistAuthSession(response)
    },
    [persistAuthSession],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: isAuthSessionUsable(session),
      login,
      register,
      logout,
      forgotPassword,
      validateResetToken,
      resetPassword,
      getClubOptions,
      updateProfile,
      changePassword,
    }),
    [
      changePassword,
      forgotPassword,
      getClubOptions,
      login,
      logout,
      register,
      resetPassword,
      session,
      updateProfile,
      validateResetToken,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
