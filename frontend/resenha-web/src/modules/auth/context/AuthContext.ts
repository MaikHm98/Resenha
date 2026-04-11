import { createContext } from 'react'
import type { AuthSession } from '../types/AuthSession'
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
  getClubOptions: () => Promise<ClubOption[]>
  updateProfile: (payload: UpdateProfileRequest) => Promise<AuthSession>
  changePassword: (payload: ChangePasswordRequest) => Promise<AuthSession>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
