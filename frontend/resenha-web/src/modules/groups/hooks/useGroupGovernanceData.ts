import { useCallback, useEffect, useMemo, useState } from 'react'
import { isNormalizedApiError } from '../../../shared/lib/api'
import { groupsApi } from '../api/groupsApi'
import type {
  AddGroupMemberResult,
  Group,
  GroupMember,
  GroupPendingInvite,
  GroupRole,
  UpdateGroupScheduleInput,
} from '../types/groupsContracts'

type LoadMode = 'initial' | 'refresh'

export type GroupGovernanceDataStatus = 'idle' | 'loading' | 'success' | 'error'

export type GroupMemberActionState = {
  isUpdatingRole: boolean
  isRemoving: boolean
  error: string | null
}

export type UseGroupGovernanceDataResult = {
  group: Group | null
  members: GroupMember[]
  pendingInvites: GroupPendingInvite[]
  status: GroupGovernanceDataStatus
  error: string | null
  pendingInvitesError: string | null
  inviteError: string | null
  inviteResult: AddGroupMemberResult | null
  memberActionNotice: string | null
  memberActionStateByUserId: Record<number, GroupMemberActionState>
  scheduleError: string | null
  scheduleNotice: string | null
  deleteGroupError: string | null
  isLoading: boolean
  isRefreshing: boolean
  isInvitingMember: boolean
  isUpdatingSchedule: boolean
  isDeletingGroup: boolean
  canViewPendingInvites: boolean
  refresh: () => Promise<void>
  inviteMember: (email: string) => Promise<boolean>
  updateMemberRole: (
    memberUserId: number,
    nextRole: GroupRole,
  ) => Promise<boolean>
  removeMember: (memberUserId: number) => Promise<boolean>
  updateSchedule: (payload: UpdateGroupScheduleInput) => Promise<boolean>
  deleteGroup: () => Promise<boolean>
  clearError: () => void
  clearInviteFeedback: () => void
  clearMemberActionError: (memberUserId: number) => void
  clearMemberActionNotice: () => void
  clearScheduleFeedback: () => void
  clearDeleteGroupFeedback: () => void
}

const DEFAULT_MEMBER_ACTION_STATE: GroupMemberActionState = {
  isUpdatingRole: false,
  isRemoving: false,
  error: null,
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

export function useGroupGovernanceData(
  groupId: number | null,
): UseGroupGovernanceDataResult {
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [pendingInvites, setPendingInvites] = useState<GroupPendingInvite[]>([])
  const [status, setStatus] = useState<GroupGovernanceDataStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [pendingInvitesError, setPendingInvitesError] = useState<string | null>(
    null,
  )
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteResult, setInviteResult] = useState<AddGroupMemberResult | null>(
    null,
  )
  const [memberActionNotice, setMemberActionNotice] = useState<string | null>(
    null,
  )
  const [memberActionStateByUserId, setMemberActionStateByUserId] = useState<
    Record<number, GroupMemberActionState>
  >({})
  const [scheduleError, setScheduleError] = useState<string | null>(null)
  const [scheduleNotice, setScheduleNotice] = useState<string | null>(null)
  const [deleteGroupError, setDeleteGroupError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isInvitingMember, setIsInvitingMember] = useState(false)
  const [isUpdatingSchedule, setIsUpdatingSchedule] = useState(false)
  const [isDeletingGroup, setIsDeletingGroup] = useState(false)

  const updateMemberActionState = useCallback(
    (
      memberUserId: number,
      nextState: Partial<GroupMemberActionState>,
    ) => {
      setMemberActionStateByUserId((currentState) => ({
        ...currentState,
        [memberUserId]: {
          ...(currentState[memberUserId] ?? DEFAULT_MEMBER_ACTION_STATE),
          ...nextState,
        },
      }))
    },
    [],
  )

  const loadData = useCallback(
    async (mode: LoadMode) => {
      if (groupId === null) {
        setGroup(null)
        setMembers([])
        setPendingInvites([])
        setPendingInvitesError(null)
        setError('Grupo invalido para carregar o detalhe.')
        setStatus('error')
        return
      }

      if (mode === 'initial') {
        setIsLoading(true)
        setStatus('loading')
      } else {
        setIsRefreshing(true)
      }

      setError(null)
      setPendingInvitesError(null)

      try {
        const myGroups = await groupsApi.getMyGroups()
        const matchedGroup = myGroups.find((currentGroup) => {
          return currentGroup.idGrupo === groupId
        })

        if (!matchedGroup) {
          setGroup(null)
          setMembers([])
          setPendingInvites([])
          setPendingInvitesError(null)
          setError('Grupo nao encontrado na sua lista de grupos.')
          setStatus('error')
          return
        }

        if (matchedGroup.perfil === 'ADMIN') {
          const [membersResult, pendingInvitesResult] = await Promise.allSettled([
            groupsApi.getGroupMembers(groupId),
            groupsApi.getGroupPendingInvites(groupId),
          ])

          if (membersResult.status === 'rejected') {
            throw membersResult.reason
          }

          setGroup(matchedGroup)
          setMembers(membersResult.value)

          if (pendingInvitesResult.status === 'fulfilled') {
            setPendingInvites(pendingInvitesResult.value)
          } else {
            setPendingInvites([])
            setPendingInvitesError(
              readRequestError(
                pendingInvitesResult.reason,
                'Nao foi possivel carregar os convites pendentes.',
              ),
            )
          }
        } else {
          const nextMembers = await groupsApi.getGroupMembers(groupId)
          setGroup(matchedGroup)
          setMembers(nextMembers)
          setPendingInvites([])
        }

        setStatus('success')
      } catch (requestError: unknown) {
        setError(
          readRequestError(
            requestError,
            'Nao foi possivel carregar os dados do grupo.',
          ),
        )
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

  const inviteMember = useCallback(
    async (email: string) => {
      if (groupId === null || group?.perfil !== 'ADMIN' || isInvitingMember) {
        return false
      }

      setInviteError(null)
      setInviteResult(null)
      setIsInvitingMember(true)

      try {
        const result = await groupsApi.addMemberByEmail(groupId, { email })
        setInviteResult(result)
        await loadData('refresh')
        return true
      } catch (requestError: unknown) {
        setInviteError(
          readRequestError(
            requestError,
            'Nao foi possivel convidar este jogador para o grupo.',
          ),
        )
        return false
      } finally {
        setIsInvitingMember(false)
      }
    },
    [group?.perfil, groupId, isInvitingMember, loadData],
  )

  const updateMemberRole = useCallback(
    async (memberUserId: number, nextRole: GroupRole) => {
      if (groupId === null || group?.perfil !== 'ADMIN') {
        return false
      }

      const actionState = memberActionStateByUserId[memberUserId]

      if (actionState?.isUpdatingRole || actionState?.isRemoving) {
        return false
      }

      setMemberActionNotice(null)
      updateMemberActionState(memberUserId, {
        isUpdatingRole: true,
        error: null,
      })

      try {
        const updatedMember = await groupsApi.updateMemberRole(groupId, memberUserId, {
          perfil: nextRole,
        })

        await loadData('refresh')

        setMemberActionNotice(
          `Perfil de ${updatedMember.nome} atualizado para ${updatedMember.perfil}.`,
        )
        updateMemberActionState(memberUserId, {
          isUpdatingRole: false,
          error: null,
        })
        return true
      } catch (requestError: unknown) {
        updateMemberActionState(memberUserId, {
          isUpdatingRole: false,
          error: readRequestError(
            requestError,
            'Nao foi possivel atualizar o papel deste membro.',
          ),
        })
        return false
      }
    },
    [group?.perfil, groupId, loadData, memberActionStateByUserId, updateMemberActionState],
  )

  const removeMember = useCallback(
    async (memberUserId: number) => {
      if (groupId === null || group?.perfil !== 'ADMIN') {
        return false
      }

      const actionState = memberActionStateByUserId[memberUserId]

      if (actionState?.isUpdatingRole || actionState?.isRemoving) {
        return false
      }

      const targetMember = members.find((member) => member.idUsuario === memberUserId)

      setMemberActionNotice(null)
      updateMemberActionState(memberUserId, {
        isRemoving: true,
        error: null,
      })

      try {
        const result = await groupsApi.removeMember(groupId, memberUserId)

        await loadData('refresh')

        setMemberActionNotice(
          targetMember
            ? `${targetMember.nome}: ${result.mensagem}`
            : result.mensagem,
        )
        setMemberActionStateByUserId((currentState) => {
          const nextState = { ...currentState }
          delete nextState[memberUserId]
          return nextState
        })
        return true
      } catch (requestError: unknown) {
        updateMemberActionState(memberUserId, {
          isRemoving: false,
          error: readRequestError(
            requestError,
            'Nao foi possivel remover este membro do grupo.',
          ),
        })
        return false
      }
    },
    [
      group?.perfil,
      groupId,
      loadData,
      memberActionStateByUserId,
      members,
      updateMemberActionState,
    ],
  )

  const updateSchedule = useCallback(
    async (payload: UpdateGroupScheduleInput) => {
      if (groupId === null || group?.perfil !== 'ADMIN' || isUpdatingSchedule) {
        return false
      }

      setScheduleError(null)
      setScheduleNotice(null)
      setIsUpdatingSchedule(true)

      try {
        const result = await groupsApi.updateGroupSchedule(groupId, payload)
        await loadData('refresh')
        setScheduleNotice(result.mensagem)
        return true
      } catch (requestError: unknown) {
        setScheduleError(
          readRequestError(
            requestError,
            'Nao foi possivel atualizar a agenda deste grupo.',
          ),
        )
        return false
      } finally {
        setIsUpdatingSchedule(false)
      }
    },
    [group?.perfil, groupId, isUpdatingSchedule, loadData],
  )

  const deleteGroup = useCallback(async () => {
    if (groupId === null || group?.perfil !== 'ADMIN' || isDeletingGroup) {
      return false
    }

    setDeleteGroupError(null)
    setIsDeletingGroup(true)

    try {
      await groupsApi.deleteGroup(groupId)
      return true
    } catch (requestError: unknown) {
      setDeleteGroupError(
        readRequestError(
          requestError,
          'Nao foi possivel excluir este grupo.',
        ),
      )
      return false
    } finally {
      setIsDeletingGroup(false)
    }
  }, [group?.perfil, groupId, isDeletingGroup])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearInviteFeedback = useCallback(() => {
    setInviteError(null)
    setInviteResult(null)
  }, [])

  const clearMemberActionError = useCallback((memberUserId: number) => {
    setMemberActionStateByUserId((currentState) => ({
      ...currentState,
      [memberUserId]: {
        ...(currentState[memberUserId] ?? DEFAULT_MEMBER_ACTION_STATE),
        error: null,
      },
    }))
  }, [])

  const clearMemberActionNotice = useCallback(() => {
    setMemberActionNotice(null)
  }, [])

  const clearScheduleFeedback = useCallback(() => {
    setScheduleError(null)
    setScheduleNotice(null)
  }, [])

  const clearDeleteGroupFeedback = useCallback(() => {
    setDeleteGroupError(null)
  }, [])

  useEffect(() => {
    setInviteError(null)
    setInviteResult(null)
    setMemberActionNotice(null)
    setMemberActionStateByUserId({})
    setScheduleError(null)
    setScheduleNotice(null)
    setDeleteGroupError(null)
  }, [groupId])

  useEffect(() => {
    void loadData('initial')
  }, [loadData])

  return useMemo(
    () => ({
      group,
      members,
      pendingInvites,
      status,
      error,
      pendingInvitesError,
      inviteError,
      inviteResult,
      memberActionNotice,
      memberActionStateByUserId,
      scheduleError,
      scheduleNotice,
      deleteGroupError,
      isLoading,
      isRefreshing,
      isInvitingMember,
      isUpdatingSchedule,
      isDeletingGroup,
      canViewPendingInvites: group?.perfil === 'ADMIN',
      refresh,
      inviteMember,
      updateMemberRole,
      removeMember,
      updateSchedule,
      deleteGroup,
      clearError,
      clearInviteFeedback,
      clearMemberActionError,
      clearMemberActionNotice,
      clearScheduleFeedback,
      clearDeleteGroupFeedback,
    }),
    [
      clearDeleteGroupFeedback,
      clearMemberActionError,
      clearMemberActionNotice,
      clearInviteFeedback,
      clearError,
      clearScheduleFeedback,
      deleteGroup,
      deleteGroupError,
      error,
      group,
      isDeletingGroup,
      isLoading,
      isInvitingMember,
      isUpdatingSchedule,
      inviteError,
      inviteMember,
      inviteResult,
      isRefreshing,
      memberActionNotice,
      memberActionStateByUserId,
      members,
      removeMember,
      pendingInvites,
      pendingInvitesError,
      refresh,
      scheduleError,
      scheduleNotice,
      status,
      updateMemberRole,
      updateSchedule,
    ],
  )
}
