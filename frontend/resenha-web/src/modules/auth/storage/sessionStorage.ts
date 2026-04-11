import {
  type AuthSession,
  isAuthSessionUsable,
} from '../types/AuthSession'

const SESSION_STORAGE_KEY = 'resenha.web.session.v1'
const SESSION_INVALIDATED_EVENT = 'resenha:auth-session-invalidated'

function isBrowserEnvironment() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function isLegacyAuthSession(candidate: unknown): candidate is {
  accessToken: string
  userId: string
  userName: string
} {
  if (typeof candidate !== 'object' || candidate === null) {
    return false
  }

  const value = candidate as Partial<AuthSession>
  return (
    typeof value.accessToken === 'string' &&
    typeof value.userId === 'string' &&
    typeof value.userName === 'string'
  )
}

function normalizeNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function normalizeNullableBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null
}

function normalizeStoredSession(candidate: unknown): AuthSession | null {
  if (!isLegacyAuthSession(candidate)) {
    return null
  }

  const value = candidate as {
    accessToken: string
    userId: string
    userName: string
  } & Partial<AuthSession>

  const normalizedSession: AuthSession = {
    accessToken: value.accessToken,
    userId: value.userId,
    userName: value.userName,
    userEmail: normalizeNullableString(value.userEmail),
    goleiro: normalizeNullableBoolean(value.goleiro),
    timeCoracaoCodigo: normalizeNullableString(value.timeCoracaoCodigo),
    timeCoracaoNome: normalizeNullableString(value.timeCoracaoNome),
    timeCoracaoEscudoUrl: normalizeNullableString(value.timeCoracaoEscudoUrl),
    posicaoPrincipal: normalizeNullableString(value.posicaoPrincipal),
    peDominante: normalizeNullableString(value.peDominante),
  }

  return isAuthSessionUsable(normalizedSession) ? normalizedSession : null
}

export function loadSessionFromStorage(): AuthSession | null {
  if (!isBrowserEnvironment()) {
    return null
  }

  const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY)
  if (!rawSession) {
    return null
  }

  try {
    const parsedSession: unknown = JSON.parse(rawSession)
    const normalizedSession = normalizeStoredSession(parsedSession)

    if (!normalizedSession) {
      clearSessionFromStorage()
      return null
    }

    return normalizedSession
  } catch {
    clearSessionFromStorage()
    return null
  }
}

export function saveSessionToStorage(session: AuthSession) {
  if (!isBrowserEnvironment()) {
    return
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearSessionFromStorage() {
  if (!isBrowserEnvironment()) {
    return
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY)
}

export function loadAccessTokenFromStorage(): string | null {
  return loadSessionFromStorage()?.accessToken ?? null
}

export function notifySessionInvalidated(status: 401 | 403) {
  if (!isBrowserEnvironment()) {
    return
  }

  window.dispatchEvent(
    new CustomEvent(SESSION_INVALIDATED_EVENT, {
      detail: { status },
    }),
  )
}

export function subscribeToSessionInvalidation(
  listener: (status: 401 | 403) => void,
) {
  if (!isBrowserEnvironment()) {
    return () => {}
  }

  const handleInvalidation = (event: Event) => {
    const invalidationEvent = event as CustomEvent<{ status?: unknown }>
    const status = invalidationEvent.detail?.status

    if (status === 401 || status === 403) {
      listener(status)
    }
  }

  window.addEventListener(SESSION_INVALIDATED_EVENT, handleInvalidation)

  return () => {
    window.removeEventListener(SESSION_INVALIDATED_EVENT, handleInvalidation)
  }
}
