import type { AuthSession } from '../types/AuthSession'

const SESSION_STORAGE_KEY = 'resenha.web.session.v1'

function isBrowserEnvironment() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function isAuthSession(candidate: unknown): candidate is AuthSession {
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
    return isAuthSession(parsedSession) ? parsedSession : null
  } catch {
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
