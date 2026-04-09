import { useCallback, useEffect, useMemo, useState } from 'react'
import { isNormalizedApiError } from '../../../shared/lib/api'
import { matchesApi } from '../api/matchesApi'
import type { CreateMatchInput, Match } from '../types/matchesContracts'

type LoadMode = 'initial' | 'refresh'

export type GroupMatchesDataStatus = 'idle' | 'loading' | 'success' | 'error'

export type UseGroupMatchesDataResult = {
  matches: Match[]
  status: GroupMatchesDataStatus
  error: string | null
  isLoading: boolean
  isRefreshing: boolean
  isCreating: boolean
  refresh: () => Promise<void>
  createMatch: (payload: CreateMatchInput) => Promise<boolean>
  clearError: () => void
}

function getLoadErrorMessage(requestError: unknown): string {
  if (isNormalizedApiError(requestError)) {
    return requestError.message
  }

  return 'Nao foi possivel carregar as partidas deste grupo.'
}

function getCreateErrorMessage(requestError: unknown): string {
  if (isNormalizedApiError(requestError)) {
    return requestError.message
  }

  return 'Nao foi possivel criar a partida.'
}

export function useGroupMatchesData(
  groupId: number | null,
): UseGroupMatchesDataResult {
  const [matches, setMatches] = useState<Match[]>([])
  const [status, setStatus] = useState<GroupMatchesDataStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const loadData = useCallback(
    async (mode: LoadMode) => {
      if (groupId === null) {
        setMatches([])
        setError('Grupo invalido para o modulo de partidas.')
        setStatus('error')
        setIsLoading(false)
        setIsRefreshing(false)
        return
      }

      if (mode === 'initial') {
        setIsLoading(true)
        setStatus('loading')
      } else {
        setIsRefreshing(true)
      }

      setError(null)

      try {
        const nextMatches = await matchesApi.getGroupMatches(groupId)
        setMatches(nextMatches)
        setStatus('success')
      } catch (requestError: unknown) {
        setError(getLoadErrorMessage(requestError))
        setStatus('error')
      } finally {
        if (mode === 'initial') {
          setIsLoading(false)
        } else {
          setIsRefreshing(false)
        }
      }
    },
    [groupId],
  )

  const refresh = useCallback(async () => {
    await loadData('refresh')
  }, [loadData])

  const createMatch = useCallback(
    async (payload: CreateMatchInput) => {
      if (groupId === null || isCreating) {
        return false
      }

      setError(null)
      setIsCreating(true)

      try {
        const createdMatch = await matchesApi.createMatch(payload)

        setMatches((currentMatches) => [
          createdMatch,
          ...currentMatches.filter(
            (match) => match.idPartida !== createdMatch.idPartida,
          ),
        ])
        setStatus('success')

        await loadData('refresh')
        return true
      } catch (requestError: unknown) {
        setError(getCreateErrorMessage(requestError))
        return false
      } finally {
        setIsCreating(false)
      }
    },
    [groupId, isCreating, loadData],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  useEffect(() => {
    void loadData('initial')
  }, [loadData])

  return useMemo(
    () => ({
      matches,
      status,
      error,
      isLoading,
      isRefreshing,
      isCreating,
      refresh,
      createMatch,
      clearError,
    }),
    [
      clearError,
      createMatch,
      error,
      isCreating,
      isLoading,
      isRefreshing,
      matches,
      refresh,
      status,
    ],
  )
}
