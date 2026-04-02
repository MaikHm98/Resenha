import { createContext } from 'react'
import type { AuthSession } from '../types/AuthSession'
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '../types/authContracts'

export type AuthContextValue = {
  session: AuthSession | null
  isAuthenticated: boolean
  login: (payload: LoginRequest) => Promise<AuthSession>
  register: (payload: RegisterRequest) => Promise<AuthSession>
  logout: () => void
  forgotPassword: (
    payload: ForgotPasswordRequest,
  ) => Promise<ForgotPasswordResponse>
  validateResetToken: (token: string) => Promise<boolean>
  resetPassword: (payload: ResetPasswordRequest) => Promise<ResetPasswordResponse>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
