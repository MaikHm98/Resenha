import axios, { AxiosHeaders } from 'axios'
import { loadAccessTokenFromStorage } from '../../../modules/auth/storage/sessionStorage'
import { apiConfig } from './apiConfig'
import { normalizeApiError } from './apiError'

export const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeoutMs,
})

apiClient.interceptors.request.use((config) => {
  const accessToken = loadAccessTokenFromStorage()
  if (!accessToken) {
    return config
  }

  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers)

  headers.set('Authorization', `Bearer ${accessToken}`)
  config.headers = headers

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normalizeApiError(error)),
)
