const DEFAULT_API_TIMEOUT_MS = 10000
const DEFAULT_LOCAL_API_ORIGIN = 'http://localhost:5276'
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1'])

function normalizeBaseUrl(value: string | undefined): string {
  return value?.trim().replace(/\/+$/, '') ?? ''
}

function parseTimeout(value: string | undefined): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_API_TIMEOUT_MS
  }

  return parsed
}

function isLocalBrowserSession(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return LOCAL_HOSTNAMES.has(window.location.hostname)
}

function resolveBaseUrl(value: string | undefined): string {
  const explicitBaseUrl = normalizeBaseUrl(value)
  if (explicitBaseUrl) {
    return explicitBaseUrl
  }

  // In development we prefer same-origin `/api` requests and let Vite proxy
  // them to the local backend. This keeps the web app usable even without `.env`.
  if (import.meta.env.DEV) {
    return ''
  }

  if (isLocalBrowserSession()) {
    return DEFAULT_LOCAL_API_ORIGIN
  }

  return ''
}

export const apiConfig = {
  baseURL: resolveBaseUrl(import.meta.env.VITE_API_BASE_URL),
  localApiOrigin: DEFAULT_LOCAL_API_ORIGIN,
  timeoutMs: parseTimeout(import.meta.env.VITE_API_TIMEOUT_MS),
}
