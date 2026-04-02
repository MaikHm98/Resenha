import { useCallback, useEffect, useMemo, useState } from 'react'
import { isNormalizedApiError } from '../../../shared/lib/api'
import { homeApi } from '../api/homeApi'
import type { HomeGroup, HomePendingInvite } from '../types/homeContracts'

type LoadMode = 'initial' | 'refresh'

export type HomeDataStatus = 'idle' | 'loading' | 'success' | 'error'

export type UseHomeDataResult = {
  groups: HomeGroup[]
  pendingInvites: HomePendingInvite[]
  status: HomeDataStatus
  error: string | null
  isLoading: boolean
  isRefreshing: boolean
  inviteActionIds: number[]
  refresh: () => Promise<void>
  clearError: () => void
  acceptInvite: (inviteId: number) => Promise<void>
  rejectInvite: (inviteId: number) => Promise<void>
  isInviteActionLoading: (inviteId: number) => boolean
}

export function useHomeData(): UseHomeDataResult {
  const [groups, setGroups] = useState<HomeGroup[]>([])
  const [pendingInvites, setPendingInvites] = useState<HomePendingInvite[]>([])
  const [status, setStatus] = useState<HomeDataStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [inviteActionIds, setInviteActionIds] = useState<number[]>([])

  const setInviteActionLoading = useCallback((inviteId: number, isLoading: boolean) => {
    setInviteActionIds((current) => {
      const hasInvite = current.includes(inviteId)

      if (isLoading && !hasInvite) {
        return [...current, inviteId]
      }

      if (!isLoading && hasInvite) {
        return current.filter((id) => id !== inviteId)
      }

      return current
    })
  }, [])

  const handleRequestError = useCallback((requestError: unknown) => {
    if (isNormalizedApiError(requestError)) {
      setError(requestError.message)
    } else {
      setError('Nao foi possivel carregar os dados da Home.')
    }
    setStatus('error')
  }, [])

  const loadData = useCallback(
    async (mode: LoadMode) => {
      if (mode === 'initial') {
        setIsLoading(true)
        setStatus('loading')
      } else {
        setIsRefreshing(true)
      }

      setError(null)

      try {
        const [nextGroups, nextPendingInvites] = await Promise.all([
          homeApi.getMyGroups(),
          homeApi.getPendingInvites(),
        ])

        setGroups(nextGroups)
        setPendingInvites(nextPendingInvites)
        setStatus('success')
      } catch (requestError: unknown) {
        handleRequestError(requestError)
      } finally {
        if (mode === 'initial') {
          setIsLoading(false)
        } else {
          setIsRefreshing(false)
        }
      }
    },
    [handleRequestError],
  )

  const refresh = useCallback(async () => {
    await loadData('refresh')
  }, [loadData])

  const acceptInvite = useCallback(
    async (inviteId: number) => {
      if (inviteActionIds.includes(inviteId)) {
        return
      }

      setError(null)
      setInviteActionLoading(inviteId, true)

      try {
        await homeApi.acceptInvite(inviteId)
        await loadData('refresh')
      } catch (requestError: unknown) {
        if (isNormalizedApiError(requestError)) {
          setError(requestError.message)
        } else {
          setError('Nao foi possivel aceitar o convite.')
        }
      } finally {
        setInviteActionLoading(inviteId, false)
      }
    },
    [inviteActionIds, loadData, setInviteActionLoading],
  )

  const rejectInvite = useCallback(
    async (inviteId: number) => {
      if (inviteActionIds.includes(inviteId)) {
        return
      }

      setError(null)
      setInviteActionLoading(inviteId, true)

      try {
        await homeApi.rejectInvite(inviteId)
        await loadData('refresh')
      } catch (requestError: unknown) {
        if (isNormalizedApiError(requestError)) {
          setError(requestError.message)
        } else {
          setError('Nao foi possivel recusar o convite.')
        }
      } finally {
        setInviteActionLoading(inviteId, false)
      }
    },
    [inviteActionIds, loadData, setInviteActionLoading],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const isInviteActionLoading = useCallback(
    (inviteId: number) => inviteActionIds.includes(inviteId),
    [inviteActionIds],
  )

  useEffect(() => {
    void loadData('initial')
  }, [loadData])

  return useMemo(
    () => ({
      groups,
      pendingInvites,
      status,
      error,
      isLoading,
      isRefreshing,
      inviteActionIds,
      refresh,
      clearError,
      acceptInvite,
      rejectInvite,
      isInviteActionLoading,
    }),
    [
      acceptInvite,
      clearError,
      error,
      groups,
      inviteActionIds,
      isInviteActionLoading,
      isLoading,
      isRefreshing,
      pendingInvites,
      refresh,
      rejectInvite,
      status,
    ],
  )
}
