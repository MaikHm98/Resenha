import axios, { type AxiosError } from 'axios'

export type ApiErrorKind = 'http' | 'network' | 'timeout' | 'canceled' | 'unknown'

export type NormalizedApiError = {
  name: 'NormalizedApiError'
  kind: ApiErrorKind
  message: string
  status: number | null
  code: string | null
  backendMessage: string | null
  backendPayload: unknown
  originalError: unknown
}

type BackendErrorShape = {
  mensagem?: unknown
  message?: unknown
  detail?: unknown
  title?: unknown
  error?: unknown
  code?: unknown
}

function readBackendMessage(payload: unknown): string | null {
  if (typeof payload === 'string' && payload.trim().length > 0) {
    return payload
  }

  if (typeof payload !== 'object' || payload === null) {
    return null
  }

  const candidate = payload as BackendErrorShape
  const possibilities = [
    candidate.mensagem,
    candidate.message,
    candidate.detail,
    candidate.title,
    candidate.error,
  ]

  for (const possibility of possibilities) {
    if (typeof possibility === 'string' && possibility.trim().length > 0) {
      return possibility
    }
  }

  return null
}

function readBackendCode(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null) {
    return null
  }

  const candidate = payload as BackendErrorShape
  return typeof candidate.code === 'string' && candidate.code.trim().length > 0
    ? candidate.code
    : null
}

function normalizeAxiosError(error: AxiosError): NormalizedApiError {
  const payload = error.response?.data ?? null
  const backendMessage = readBackendMessage(payload)
  const backendCode = readBackendCode(payload)
  const status = error.response?.status ?? null
  const code = backendCode ?? error.code ?? null
  const isCanceled = code === 'ERR_CANCELED'
  const isTimeout = code === 'ECONNABORTED'
  const isNetwork = error.response === undefined && !isCanceled && !isTimeout

  let kind: ApiErrorKind = 'unknown'
  if (isCanceled) {
    kind = 'canceled'
  } else if (isTimeout) {
    kind = 'timeout'
  } else if (isNetwork) {
    kind = 'network'
  } else if (error.response !== undefined) {
    kind = 'http'
  }

  const message =
    backendMessage ??
    error.message ??
    (kind === 'network'
      ? 'Falha de rede ao comunicar com a API.'
      : 'Erro inesperado ao comunicar com a API.')

  return {
    name: 'NormalizedApiError',
    kind,
    message,
    status,
    code,
    backendMessage,
    backendPayload: payload,
    originalError: error,
  }
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    return normalizeAxiosError(error)
  }

  if (error instanceof Error) {
    return {
      name: 'NormalizedApiError',
      kind: 'unknown',
      message: error.message,
      status: null,
      code: null,
      backendMessage: null,
      backendPayload: null,
      originalError: error,
    }
  }

  return {
    name: 'NormalizedApiError',
    kind: 'unknown',
    message: 'Erro inesperado ao comunicar com a API.',
    status: null,
    code: null,
    backendMessage: null,
    backendPayload: null,
    originalError: error,
  }
}

export function isNormalizedApiError(value: unknown): value is NormalizedApiError {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  return (value as { name?: unknown }).name === 'NormalizedApiError'
}
