import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isNormalizedApiError } from '../../../shared/lib/api'
import { matchesApi } from '../api/matchesApi'
import type { MatchDetail } from '../types/matchesContracts'

type LoadMode = 'initial' | 'refresh'

export type MatchHistoryDataStatus = 'idle' | 'loading' | 'success' | 'error'

export type UseMatchHistoryDataResult = {
  match: MatchDetail | null
  status: MatchHistoryDataStatus
  error: string | null
  isLoading: boolean
  isRefreshing: boolean
  refresh: () => Promise<void>
  clearError: () => void
}

function getLoadErrorMessage(requestError: unknown): string {
  if (isNormalizedApiError(requestError)) {
    return requestError.message
  }

  return 'Nao foi possivel carregar o detalhe historico desta partida.'
}

export function useMatchHistoryData(
  matchId: number | null,
): UseMatchHistoryDataResult {
  const [match, setMatch] = useState<MatchDetail | null>(null)
  const [status, setStatus] = useState<MatchHistoryDataStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const matchRef = useRef<MatchDetail | null>(null)

  const loadData = useCallback(
    async (mode: LoadMode) => {
      if (matchId === null) {
        setMatch(null)
        setError('Partida invalida para o historico.')
        setStatus('error')
        setIsLoading(false)
        setIsRefreshing(false)
        return
      }

      if (mode === 'initial') {
        setMatch(null)
        setIsLoading(true)
        setStatus('loading')
      } else {
        setIsRefreshing(true)
      }

      setError(null)

      try {
        const nextMatch = await matchesApi.getMatchDetails(matchId)
        setMatch(nextMatch)
        setStatus('success')
      } catch (requestError: unknown) {
        const nextError = getLoadErrorMessage(requestError)
        setError(nextError)

        if (mode === 'refresh' && matchRef.current !== null) {
          setMatch(matchRef.current)
          setStatus('success')
        } else {
          setMatch(null)
          setStatus('error')
        }
      } finally {
        if (mode === 'initial') {
          setIsLoading(false)
        } else {
          setIsRefreshing(false)
        }
      }
    },
    [matchId],
  )

  const refresh = useCallback(async () => {
    await loadData('refresh')
  }, [loadData])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  useEffect(() => {
    matchRef.current = match
  }, [match])

  useEffect(() => {
    setMatch(null)
    setStatus('idle')
    setError(null)
    setIsLoading(false)
    setIsRefreshing(false)
    void loadData('initial')
  }, [loadData])

  return useMemo(
    () => ({
      match,
      status,
      error,
      isLoading,
      isRefreshing,
      refresh,
      clearError,
    }),
    [clearError, error, isLoading, isRefreshing, match, refresh, status],
  )
}
