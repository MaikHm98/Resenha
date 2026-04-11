import { useCallback, useEffect, useMemo, useState } from 'react'
import { isNormalizedApiError } from '../../../shared/lib/api'
import { homeApi } from '../api/homeApi'
import type { HomeGroup, HomePendingInvite } from '../types/homeContracts'

type LoadMode = 'initial' | 'refresh'

export type HomeDataStatus = 'idle' | 'loading' | 'success' | 'error'

type HomeLoadResult = {
  ok: boolean
  hasPartialFailure: boolean
}

export type UseHomeDataResult = {
  groups: HomeGroup[]
  pendingInvites: HomePendingInvite[]
  status: HomeDataStatus
  error: string | null
  groupsError: string | null
  pendingInvitesError: string | null
  notice: string | null
  isLoading: boolean
  isRefreshing: boolean
  inviteActionIds: number[]
  refresh: () => Promise<void>
  clearError: () => void
  clearNotice: () => void
  acceptInvite: (inviteId: number) => Promise<void>
  rejectInvite: (inviteId: number) => Promise<void>
  isInviteActionLoading: (inviteId: number) => boolean
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

function buildPostMutationNotice(
  successMessage: string,
  loadResult: HomeLoadResult,
): string {
  if (!loadResult.ok) {
    return `${successMessage} A acao foi concluida, mas nao foi possivel recarregar a Home agora.`
  }

  if (loadResult.hasPartialFailure) {
    return `${successMessage} A Home foi mantida ativa, mas alguns blocos nao puderam ser atualizados agora.`
  }

  return successMessage
}

export function useHomeData(): UseHomeDataResult {
  const [groups, setGroups] = useState<HomeGroup[]>([])
  const [pendingInvites, setPendingInvites] = useState<HomePendingInvite[]>([])
  const [status, setStatus] = useState<HomeDataStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [groupsError, setGroupsError] = useState<string | null>(null)
  const [pendingInvitesError, setPendingInvitesError] = useState<string | null>(
    null,
  )
  const [notice, setNotice] = useState<string | null>(null)
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

  const loadData = useCallback(
    async (mode: LoadMode): Promise<HomeLoadResult> => {
      if (mode === 'initial') {
        setIsLoading(true)
        setStatus('loading')
      } else {
        setIsRefreshing(true)
      }

      setError(null)
      setGroupsError(null)
      setPendingInvitesError(null)

      try {
        const [groupsResult, pendingInvitesResult] = await Promise.allSettled([
          homeApi.getMyGroups(),
          homeApi.getPendingInvites(),
        ])

        let nextGroupsError: string | null = null
        let nextPendingInvitesError: string | null = null

        if (groupsResult.status === 'fulfilled') {
          setGroups(groupsResult.value)
        } else {
          nextGroupsError = readRequestError(
            groupsResult.reason,
            'Nao foi possivel carregar seus grupos agora.',
          )
        }

        if (pendingInvitesResult.status === 'fulfilled') {
          setPendingInvites(pendingInvitesResult.value)
        } else {
          nextPendingInvitesError = readRequestError(
            pendingInvitesResult.reason,
            'Nao foi possivel carregar seus convites pendentes agora.',
          )
        }

        setGroupsError(nextGroupsError)
        setPendingInvitesError(nextPendingInvitesError)

        const allRequestsFailed =
          groupsResult.status === 'rejected' &&
          pendingInvitesResult.status === 'rejected'

        if (allRequestsFailed) {
          setError('Nao foi possivel carregar os dados da Home.')
          setStatus('error')
          return {
            ok: false,
            hasPartialFailure: false,
          }
        }

        setStatus('success')
        return {
          ok: true,
          hasPartialFailure:
            nextGroupsError !== null || nextPendingInvitesError !== null,
        }
      } finally {
        if (mode === 'initial') {
          setIsLoading(false)
        } else {
          setIsRefreshing(false)
        }
      }
    },
    [],
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
      setNotice(null)
      setInviteActionLoading(inviteId, true)

      try {
        const acceptedGroup = await homeApi.acceptInvite(inviteId)

        setGroups((current) => [
          acceptedGroup,
          ...current.filter((group) => group.idGrupo !== acceptedGroup.idGrupo),
        ])
        setPendingInvites((current) =>
          current.filter((invite) => invite.idConvite !== inviteId),
        )
        setStatus('success')

        const loadResult = await loadData('refresh')
        setError(null)
        setStatus('success')
        setNotice(
          buildPostMutationNotice('Convite aceito com sucesso.', loadResult),
        )
      } catch (requestError: unknown) {
        setError(
          readRequestError(requestError, 'Nao foi possivel aceitar o convite.'),
        )
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
      setNotice(null)
      setInviteActionLoading(inviteId, true)

      try {
        await homeApi.rejectInvite(inviteId)

        setPendingInvites((current) =>
          current.filter((invite) => invite.idConvite !== inviteId),
        )
        setStatus('success')

        const loadResult = await loadData('refresh')
        setError(null)
        setStatus('success')
        setNotice(
          buildPostMutationNotice('Convite recusado com sucesso.', loadResult),
        )
      } catch (requestError: unknown) {
        setError(
          readRequestError(requestError, 'Nao foi possivel recusar o convite.'),
        )
      } finally {
        setInviteActionLoading(inviteId, false)
      }
    },
    [inviteActionIds, loadData, setInviteActionLoading],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearNotice = useCallback(() => {
    setNotice(null)
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
      groupsError,
      pendingInvitesError,
      notice,
      isLoading,
      isRefreshing,
      inviteActionIds,
      refresh,
      clearError,
      clearNotice,
      acceptInvite,
      rejectInvite,
      isInviteActionLoading,
    }),
    [
      acceptInvite,
      clearError,
      clearNotice,
      error,
      groupsError,
      groups,
      inviteActionIds,
      isInviteActionLoading,
      isLoading,
      isRefreshing,
      notice,
      pendingInvites,
      pendingInvitesError,
      refresh,
      rejectInvite,
      status,
    ],
  )
}
