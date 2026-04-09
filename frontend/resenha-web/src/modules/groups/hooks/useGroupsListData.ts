import { useCallback, useEffect, useMemo, useState } from 'react'
import { isNormalizedApiError } from '../../../shared/lib/api'
import { groupsApi } from '../api/groupsApi'
import type { CreateGroupInput, Group } from '../types/groupsContracts'

type LoadMode = 'initial' | 'refresh'

export type GroupsListDataStatus = 'idle' | 'loading' | 'success' | 'error'

export type UseGroupsListDataResult = {
  groups: Group[]
  status: GroupsListDataStatus
  error: string | null
  isLoading: boolean
  isRefreshing: boolean
  isCreating: boolean
  refresh: () => Promise<void>
  createGroup: (payload: CreateGroupInput) => Promise<boolean>
  clearError: () => void
}

export function useGroupsListData(): UseGroupsListDataResult {
  const [groups, setGroups] = useState<Group[]>([])
  const [status, setStatus] = useState<GroupsListDataStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const handleLoadError = useCallback((requestError: unknown) => {
    if (isNormalizedApiError(requestError)) {
      setError(requestError.message)
    } else {
      setError('Nao foi possivel carregar seus grupos.')
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
        const nextGroups = await groupsApi.getMyGroups()
        setGroups(nextGroups)
        setStatus('success')
      } catch (requestError: unknown) {
        handleLoadError(requestError)
      } finally {
        if (mode === 'initial') {
          setIsLoading(false)
        } else {
          setIsRefreshing(false)
        }
      }
    },
    [handleLoadError],
  )

  const refresh = useCallback(async () => {
    await loadData('refresh')
  }, [loadData])

  const createGroup = useCallback(
    async (payload: CreateGroupInput) => {
      if (isCreating) {
        return false
      }

      setError(null)
      setIsCreating(true)

      try {
        const createdGroup = await groupsApi.createGroup(payload)

        setGroups((current) => [
          createdGroup,
          ...current.filter((group) => group.idGrupo !== createdGroup.idGrupo),
        ])
        setStatus('success')

        await loadData('refresh')
        return true
      } catch (requestError: unknown) {
        if (isNormalizedApiError(requestError)) {
          setError(requestError.message)
        } else {
          setError('Nao foi possivel criar o grupo.')
        }

        return false
      } finally {
        setIsCreating(false)
      }
    },
    [isCreating, loadData],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  useEffect(() => {
    void loadData('initial')
  }, [loadData])

  return useMemo(
    () => ({
      groups,
      status,
      error,
      isLoading,
      isRefreshing,
      isCreating,
      refresh,
      createGroup,
      clearError,
    }),
    [
      clearError,
      createGroup,
      error,
      groups,
      isCreating,
      isLoading,
      isRefreshing,
      refresh,
      status,
    ],
  )
}
