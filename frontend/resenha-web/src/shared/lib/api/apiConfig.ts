const DEFAULT_API_TIMEOUT_MS = 10000

function parseTimeout(value: string | undefined): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_API_TIMEOUT_MS
  }

  return parsed
}

export const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  timeoutMs: parseTimeout(import.meta.env.VITE_API_TIMEOUT_MS),
}
