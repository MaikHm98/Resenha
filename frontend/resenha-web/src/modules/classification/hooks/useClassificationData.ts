import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isNormalizedApiError } from '../../../shared/lib/api'
import { classificationApi } from '../api/classificationApi'
import type {
  ClassificationRanking,
  MyClassificationStats,
} from '../types/classificationContracts'

type LoadMode = 'initial' | 'refresh'

export type ClassificationDataStatus = 'idle' | 'loading' | 'success' | 'error'

export type UseClassificationDataResult = {
  seasonRanking: ClassificationRanking | null
  allTimeRanking: ClassificationRanking | null
  myStats: MyClassificationStats | null
  status: ClassificationDataStatus
  error: string | null
  allTimeError: string | null
  myStatsError: string | null
  hasNoActiveSeason: boolean
  isLoading: boolean
  isRefreshing: boolean
  isLoadingAllTime: boolean
  isLoadingMyStats: boolean
  refresh: () => Promise<void>
  clearError: () => void
}

function normalizeTextForComparison(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function readRequestError(
  requestError: unknown,
  fallbackMessage: string,
): string {
  if (isNormalizedApiError(requestError)) {
    return requestError.message
  }

  return fallbackMessage
}

function isNoActiveSeasonRequestError(requestError: unknown): boolean {
  if (!isNormalizedApiError(requestError)) {
    return false
  }

  const normalizedMessage = normalizeTextForComparison(requestError.message)
  return normalizedMessage.includes('nao ha temporada ativa neste grupo')
}

export function useClassificationData(
  groupId: number | null,
): UseClassificationDataResult {
  const [seasonRanking, setSeasonRanking] = useState<ClassificationRanking | null>(
    null,
  )
  const [allTimeRanking, setAllTimeRanking] =
    useState<ClassificationRanking | null>(null)
  const [myStats, setMyStats] = useState<MyClassificationStats | null>(null)
  const [status, setStatus] = useState<ClassificationDataStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [allTimeError, setAllTimeError] = useState<string | null>(null)
  const [myStatsError, setMyStatsError] = useState<string | null>(null)
  const [hasNoActiveSeason, setHasNoActiveSeason] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingAllTime, setIsLoadingAllTime] = useState(false)
  const [isLoadingMyStats, setIsLoadingMyStats] = useState(false)
  const seasonRankingRef = useRef<ClassificationRanking | null>(null)
  const allTimeRankingRef = useRef<ClassificationRanking | null>(null)
  const myStatsRef = useRef<MyClassificationStats | null>(null)
  const hasNoActiveSeasonRef = useRef(false)

  const loadData = useCallback(
    async (mode: LoadMode) => {
      if (groupId === null) {
        setSeasonRanking(null)
        setAllTimeRanking(null)
        setMyStats(null)
        setHasNoActiveSeason(false)
        setError('Grupo invalido para carregar a classificacao.')
        setAllTimeError(null)
        setMyStatsError(null)
        setStatus('error')
        setIsLoading(false)
        setIsRefreshing(false)
        setIsLoadingAllTime(false)
        setIsLoadingMyStats(false)
        return
      }

      if (mode === 'initial') {
        setSeasonRanking(null)
        setAllTimeRanking(null)
        setMyStats(null)
        setHasNoActiveSeason(false)
        setIsLoading(true)
        setStatus('loading')
      } else {
        setIsRefreshing(true)
      }

      setError(null)
      setAllTimeError(null)

      let canRenderPage = false
      let shouldLoadMyStats = false

      setIsLoadingAllTime(true)
      try {
        const nextAllTimeRanking =
          await classificationApi.getAllTimeClassification(groupId)
        setAllTimeRanking(nextAllTimeRanking)
        canRenderPage = true
      } catch (requestError: unknown) {
        const nextAllTimeError = readRequestError(
          requestError,
          'Nao foi possivel carregar o ranking historico.',
        )
        setAllTimeError(nextAllTimeError)

        if (mode === 'refresh' && allTimeRankingRef.current !== null) {
          setAllTimeRanking(allTimeRankingRef.current)
          canRenderPage = true
        } else {
          setAllTimeRanking(null)
        }
      } finally {
        setIsLoadingAllTime(false)
      }

      try {
        const nextSeasonRanking =
          await classificationApi.getSeasonClassification(groupId)
        setSeasonRanking(nextSeasonRanking)
        setHasNoActiveSeason(false)
        shouldLoadMyStats = true
        canRenderPage = true
      } catch (requestError: unknown) {
        if (isNoActiveSeasonRequestError(requestError)) {
          setSeasonRanking(null)
          setMyStats(null)
          setHasNoActiveSeason(true)
          setError(null)
          setMyStatsError(null)
          setIsLoadingMyStats(false)
          canRenderPage = true
        } else {
          const nextError = readRequestError(
            requestError,
            'Nao foi possivel carregar a classificacao da temporada.',
          )
          const hasRenderableSeasonState =
            seasonRankingRef.current !== null || hasNoActiveSeasonRef.current

          setError(nextError)

          if (mode === 'refresh' && hasRenderableSeasonState) {
            if (
              seasonRankingRef.current !== null ||
              hasNoActiveSeasonRef.current
            ) {
              canRenderPage = true
            }
          } else {
            setSeasonRanking(null)
            setMyStats(null)
            setHasNoActiveSeason(false)
            setMyStatsError(null)
            setIsLoadingMyStats(false)
          }
        }
      }

      if (shouldLoadMyStats) {
        setMyStatsError(null)
        setIsLoadingMyStats(true)
        try {
          const nextMyStats =
            await classificationApi.getMyClassificationStats(groupId)
          setMyStats(nextMyStats)
        } catch (requestError: unknown) {
          setMyStatsError(
            readRequestError(
              requestError,
              'Nao foi possivel carregar o desempenho individual.',
            ),
          )

          if (mode === 'initial') {
            setMyStats(null)
          } else if (myStatsRef.current !== null) {
            setMyStats(myStatsRef.current)
          } else {
            setMyStats(null)
          }
        } finally {
          setIsLoadingMyStats(false)
        }
      }

      if (canRenderPage) {
        setStatus('success')
      } else {
        setStatus('error')
      }

      if (mode === 'initial') {
        setIsLoading(false)
      } else {
        setIsRefreshing(false)
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

  useEffect(() => {
    seasonRankingRef.current = seasonRanking
  }, [seasonRanking])

  useEffect(() => {
    allTimeRankingRef.current = allTimeRanking
  }, [allTimeRanking])

  useEffect(() => {
    myStatsRef.current = myStats
  }, [myStats])

  useEffect(() => {
    hasNoActiveSeasonRef.current = hasNoActiveSeason
  }, [hasNoActiveSeason])

  useEffect(() => {
    setSeasonRanking(null)
    setAllTimeRanking(null)
    setMyStats(null)
    setStatus('idle')
    setError(null)
    setAllTimeError(null)
    setMyStatsError(null)
    setHasNoActiveSeason(false)
    setIsLoading(false)
    setIsRefreshing(false)
    setIsLoadingAllTime(false)
    setIsLoadingMyStats(false)
    void loadData('initial')
  }, [loadData])

  return useMemo(
    () => ({
      seasonRanking,
      allTimeRanking,
      myStats,
      status,
      error,
      allTimeError,
      myStatsError,
      hasNoActiveSeason,
      isLoading,
      isRefreshing,
      isLoadingAllTime,
      isLoadingMyStats,
      refresh,
      clearError,
    }),
    [
      allTimeError,
      allTimeRanking,
      clearError,
      error,
      hasNoActiveSeason,
      isLoading,
      isLoadingAllTime,
      isLoadingMyStats,
      isRefreshing,
      myStats,
      myStatsError,
      refresh,
      seasonRanking,
      status,
    ],
  )
}
