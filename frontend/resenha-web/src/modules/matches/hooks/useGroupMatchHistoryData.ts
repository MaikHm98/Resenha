import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isNormalizedApiError } from '../../../shared/lib/api'
import { matchesApi } from '../api/matchesApi'
import type { MatchHistorySummary, MatchStatus } from '../types/matchesContracts'

type LoadMode = 'initial' | 'refresh'
export type MatchHistoryStatusFilter = MatchStatus | 'TODOS'

export type GroupMatchHistoryDataStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error'

export type UseGroupMatchHistoryDataResult = {
  history: MatchHistorySummary[]
  filteredHistory: MatchHistorySummary[]
  status: GroupMatchHistoryDataStatus
  error: string | null
  searchTerm: string
  statusFilter: MatchHistoryStatusFilter
  hasActiveFilters: boolean
  isLoading: boolean
  isRefreshing: boolean
  updateSearchTerm: (value: string) => void
  updateStatusFilter: (value: MatchHistoryStatusFilter) => void
  clearFilters: () => void
  refresh: () => Promise<void>
  clearError: () => void
}

function getLoadErrorMessage(requestError: unknown): string {
  if (isNormalizedApiError(requestError)) {
    return requestError.message
  }

  return 'Nao foi possivel carregar o historico deste grupo.'
}

function normalizeTextForComparison(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function buildSearchableText(match: MatchHistorySummary): string {
  return [
    String(match.idPartida),
    match.dataHoraJogo,
    match.status,
    match.nomeCapitaoTime1 ?? '',
    match.nomeCapitaoTime2 ?? '',
    match.nomeCapitaoVencedor ?? '',
  ].join(' ')
}

export function useGroupMatchHistoryData(
  groupId: number | null,
): UseGroupMatchHistoryDataResult {
  const [history, setHistory] = useState<MatchHistorySummary[]>([])
  const [status, setStatus] = useState<GroupMatchHistoryDataStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<MatchHistoryStatusFilter>('TODOS')
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const historyRef = useRef<MatchHistorySummary[]>([])

  const loadData = useCallback(
    async (mode: LoadMode) => {
      if (groupId === null) {
        setHistory([])
        setError('Grupo invalido para o historico de partidas.')
        setStatus('error')
        setIsLoading(false)
        setIsRefreshing(false)
        return
      }

      if (mode === 'initial') {
        setHistory([])
        setIsLoading(true)
        setStatus('loading')
      } else {
        setIsRefreshing(true)
      }

      setError(null)

      try {
        const nextHistory = await matchesApi.getGroupMatchHistory(groupId)
        setHistory(nextHistory)
        setStatus('success')
      } catch (requestError: unknown) {
        const nextError = getLoadErrorMessage(requestError)
        setError(nextError)

        if (mode === 'refresh' && historyRef.current.length > 0) {
          setHistory(historyRef.current)
          setStatus('success')
        } else {
          setHistory([])
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
    [groupId],
  )

  const refresh = useCallback(async () => {
    await loadData('refresh')
  }, [loadData])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const updateSearchTerm = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  const updateStatusFilter = useCallback((value: MatchHistoryStatusFilter) => {
    setStatusFilter(value)
  }, [])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setStatusFilter('TODOS')
  }, [])

  const filteredHistory = useMemo(() => {
    const normalizedSearchTerm = normalizeTextForComparison(searchTerm.trim())

    return history.filter((match) => {
      if (statusFilter !== 'TODOS' && match.status !== statusFilter) {
        return false
      }

      if (normalizedSearchTerm === '') {
        return true
      }

      const normalizedSearchableText = normalizeTextForComparison(
        buildSearchableText(match),
      )

      return normalizedSearchableText.includes(normalizedSearchTerm)
    })
  }, [history, searchTerm, statusFilter])

  const hasActiveFilters =
    statusFilter !== 'TODOS' || searchTerm.trim().length > 0

  useEffect(() => {
    historyRef.current = history
  }, [history])

  useEffect(() => {
    setHistory([])
    setStatus('idle')
    setError(null)
    setSearchTerm('')
    setStatusFilter('TODOS')
    setIsLoading(false)
    setIsRefreshing(false)
    void loadData('initial')
  }, [loadData])

  return useMemo(
    () => ({
      history,
      filteredHistory,
      status,
      error,
      searchTerm,
      statusFilter,
      hasActiveFilters,
      isLoading,
      isRefreshing,
      updateSearchTerm,
      updateStatusFilter,
      clearFilters,
      refresh,
      clearError,
    }),
    [
      clearError,
      clearFilters,
      error,
      filteredHistory,
      hasActiveFilters,
      history,
      isLoading,
      isRefreshing,
      refresh,
      searchTerm,
      status,
      statusFilter,
      updateSearchTerm,
      updateStatusFilter,
    ],
  )
}
