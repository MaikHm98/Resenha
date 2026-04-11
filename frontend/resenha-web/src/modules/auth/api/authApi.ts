import { apiClient } from '../../../shared/lib/api'
import type {
  AuthApiResponse,
  ChangePasswordRequest,
  ClubOption,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UpdateProfileRequest,
  ValidateResetTokenResponse,
} from '../types/authContracts'

const AUTH_BASE_PATH = '/api/users'

async function login(payload: LoginRequest): Promise<AuthApiResponse> {
  const response = await apiClient.post<AuthApiResponse>(
    `${AUTH_BASE_PATH}/login`,
    payload,
  )
  return response.data
}

async function register(payload: RegisterRequest): Promise<AuthApiResponse> {
  const response = await apiClient.post<AuthApiResponse>(
    `${AUTH_BASE_PATH}/register`,
    payload,
  )
  return response.data
}

async function forgotPassword(
  payload: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  const response = await apiClient.post<ForgotPasswordResponse>(
    `${AUTH_BASE_PATH}/forgot-password`,
    payload,
  )
  return response.data
}

async function validateResetToken(
  token: string,
): Promise<ValidateResetTokenResponse> {
  const response = await apiClient.get<ValidateResetTokenResponse>(
    `${AUTH_BASE_PATH}/reset-password/validate`,
    {
      params: { token },
    },
  )
  return response.data
}

async function resetPassword(
  payload: ResetPasswordRequest,
): Promise<ResetPasswordResponse> {
  const response = await apiClient.post<ResetPasswordResponse>(
    `${AUTH_BASE_PATH}/reset-password`,
    payload,
  )
  return response.data
}

async function getClubOptions(): Promise<ClubOption[]> {
  const response = await apiClient.get<ClubOption[]>(`${AUTH_BASE_PATH}/clubs`)
  return response.data
}

async function updateProfile(
  payload: UpdateProfileRequest,
): Promise<AuthApiResponse> {
  const response = await apiClient.patch<AuthApiResponse>(
    `${AUTH_BASE_PATH}/profile`,
    payload,
  )
  return response.data
}

async function changePassword(
  payload: ChangePasswordRequest,
): Promise<AuthApiResponse> {
  const response = await apiClient.patch<AuthApiResponse>(
    `${AUTH_BASE_PATH}/change-password`,
    payload,
  )
  return response.data
}

export const authApi = {
  login,
  register,
  forgotPassword,
  validateResetToken,
  resetPassword,
  getClubOptions,
  updateProfile,
  changePassword,
}
