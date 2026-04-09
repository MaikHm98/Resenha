import { useCallback, useEffect, useMemo, useState } from 'react'
import { isNormalizedApiError } from '../../../shared/lib/api'
import { groupsApi } from '../../groups/api/groupsApi'
import { matchesApi } from '../api/matchesApi'
import type { MatchDetail, MatchPresenceResult } from '../types/matchesContracts'

type LoadMode = 'initial' | 'refresh'

export type MatchDetailDataStatus = 'idle' | 'loading' | 'success' | 'error'
export type MatchUserAttendanceStatus = 'CONFIRMADO' | 'AUSENTE' | 'NEUTRO'
export type MatchPlayerActionKind =
  | 'confirmPresence'
  | 'cancelPresence'
  | 'markAbsent'
  | 'cancelAbsent'

export type UseMatchDetailDataResult = {
  match: MatchDetail | null
  userAttendanceStatus: MatchUserAttendanceStatus | null
  canManageMatch: boolean
  status: MatchDetailDataStatus
  error: string | null
  actionError: string | null
  actionNotice: string | null
  activeAction: MatchPlayerActionKind | null
  guestError: string | null
  guestNotice: string | null
  deleteMatchError: string | null
  isLoading: boolean
  isRefreshing: boolean
  isSubmittingAction: boolean
  isAddingGuest: boolean
  isDeletingMatch: boolean
  refresh: () => Promise<void>
  confirmPresence: () => Promise<boolean>
  cancelPresence: () => Promise<boolean>
  markAbsent: () => Promise<boolean>
  cancelAbsent: () => Promise<boolean>
  addGuest: (name: string) => Promise<boolean>
  deleteMatch: () => Promise<boolean>
  clearError: () => void
  clearActionFeedback: () => void
  clearGuestFeedback: () => void
  clearDeleteMatchFeedback: () => void
}

function getLoadErrorMessage(requestError: unknown): string {
  if (isNormalizedApiError(requestError)) {
    return requestError.message
  }

  return 'Nao foi possivel carregar o detalhe da partida.'
}

function getActionErrorMessage(
  action: MatchPlayerActionKind,
  requestError: unknown,
): string {
  if (isNormalizedApiError(requestError)) {
    return requestError.message
  }

  switch (action) {
    case 'confirmPresence':
      return 'Nao foi possivel confirmar sua presenca.'
    case 'cancelPresence':
      return 'Nao foi possivel cancelar sua presenca.'
    case 'markAbsent':
      return 'Nao foi possivel marcar sua ausencia.'
    case 'cancelAbsent':
      return 'Nao foi possivel remover sua ausencia.'
  }
}

function getActionNotice(action: MatchPlayerActionKind): string {
  switch (action) {
    case 'confirmPresence':
      return 'Presenca confirmada com sucesso.'
    case 'cancelPresence':
      return 'Confirmacao removida com sucesso.'
    case 'markAbsent':
      return 'Ausencia marcada com sucesso.'
    case 'cancelAbsent':
      return 'Ausencia removida com sucesso.'
  }
}

async function getCurrentUserAttendanceStatus(
  groupId: number,
  matchId: number,
): Promise<MatchUserAttendanceStatus | null> {
  const groupMatches = await matchesApi.getGroupMatches(groupId)
  const currentMatch = groupMatches.find((match) => match.idPartida === matchId)

  if (!currentMatch) {
    return null
  }

  if (currentMatch.usuarioConfirmado) {
    return 'CONFIRMADO'
  }

  if (currentMatch.usuarioAusente) {
    return 'AUSENTE'
  }

  return 'NEUTRO'
}

async function getCurrentUserCanManageMatch(groupId: number): Promise<boolean> {
  const myGroups = await groupsApi.getMyGroups()
  const currentGroup = myGroups.find((group) => group.idGrupo === groupId)

  return currentGroup?.perfil === 'ADMIN'
}

export function useMatchDetailData(
  matchId: number | null,
): UseMatchDetailDataResult {
  const [match, setMatch] = useState<MatchDetail | null>(null)
  const [userAttendanceStatus, setUserAttendanceStatus] =
    useState<MatchUserAttendanceStatus | null>(null)
  const [canManageMatch, setCanManageMatch] = useState(false)
  const [status, setStatus] = useState<MatchDetailDataStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionNotice, setActionNotice] = useState<string | null>(null)
  const [activeAction, setActiveAction] = useState<MatchPlayerActionKind | null>(
    null,
  )
  const [guestError, setGuestError] = useState<string | null>(null)
  const [guestNotice, setGuestNotice] = useState<string | null>(null)
  const [deleteMatchError, setDeleteMatchError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)
  const [isAddingGuest, setIsAddingGuest] = useState(false)
  const [isDeletingMatch, setIsDeletingMatch] = useState(false)

  const loadData = useCallback(
    async (mode: LoadMode) => {
      if (matchId === null) {
        setMatch(null)
        setUserAttendanceStatus(null)
        setCanManageMatch(false)
        setError('Partida invalida para o modulo de partidas.')
        setStatus('error')
        setIsLoading(false)
        setIsRefreshing(false)
        return
      }

      if (mode === 'initial') {
        setMatch(null)
        setUserAttendanceStatus(null)
        setCanManageMatch(false)
        setIsLoading(true)
        setStatus('loading')
      } else {
        setIsRefreshing(true)
      }

      setError(null)

      try {
        const nextMatch = await matchesApi.getMatchDetails(matchId)
        setMatch(nextMatch)

        const [attendanceStatusResult, canManageResult] = await Promise.allSettled(
          [
            getCurrentUserAttendanceStatus(nextMatch.idGrupo, matchId),
            getCurrentUserCanManageMatch(nextMatch.idGrupo),
          ],
        )

        setUserAttendanceStatus(
          attendanceStatusResult.status === 'fulfilled'
            ? attendanceStatusResult.value
            : null,
        )
        setCanManageMatch(
          canManageResult.status === 'fulfilled' ? canManageResult.value : false,
        )
        setStatus('success')
      } catch (requestError: unknown) {
        setUserAttendanceStatus(null)
        setCanManageMatch(false)
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
    [matchId],
  )

  const refresh = useCallback(async () => {
    await loadData('refresh')
  }, [loadData])

  const runPlayerAction = useCallback(
    async (
      action: MatchPlayerActionKind,
      request: () => Promise<MatchPresenceResult>,
    ) => {
      if (matchId === null || isSubmittingAction) {
        return false
      }

      setActionError(null)
      setActionNotice(null)
      setIsSubmittingAction(true)
      setActiveAction(action)

      try {
        await request()
        setActionNotice(getActionNotice(action))
        await loadData('refresh')
        return true
      } catch (requestError: unknown) {
        setActionError(getActionErrorMessage(action, requestError))
        return false
      } finally {
        setIsSubmittingAction(false)
        setActiveAction(null)
      }
    },
    [isSubmittingAction, loadData, matchId],
  )

  const confirmPresence = useCallback(async () => {
    return runPlayerAction('confirmPresence', async () => {
      if (matchId === null) {
        throw new Error('Partida invalida.')
      }

      return matchesApi.confirmPresence(matchId)
    })
  }, [matchId, runPlayerAction])

  const cancelPresence = useCallback(async () => {
    return runPlayerAction('cancelPresence', async () => {
      if (matchId === null) {
        throw new Error('Partida invalida.')
      }

      return matchesApi.cancelPresence(matchId)
    })
  }, [matchId, runPlayerAction])

  const markAbsent = useCallback(async () => {
    return runPlayerAction('markAbsent', async () => {
      if (matchId === null) {
        throw new Error('Partida invalida.')
      }

      return matchesApi.markAbsent(matchId)
    })
  }, [matchId, runPlayerAction])

  const cancelAbsent = useCallback(async () => {
    return runPlayerAction('cancelAbsent', async () => {
      if (matchId === null) {
        throw new Error('Partida invalida.')
      }

      return matchesApi.cancelAbsent(matchId)
    })
  }, [matchId, runPlayerAction])

  const addGuest = useCallback(
    async (name: string) => {
      if (
        matchId === null ||
        !canManageMatch ||
        isAddingGuest
      ) {
        return false
      }

      setGuestError(null)
      setGuestNotice(null)
      setIsAddingGuest(true)

      try {
        await matchesApi.addGuestToMatch(matchId, { nome: name })
        setGuestNotice('Convidado adicionado com sucesso.')
        await loadData('refresh')
        return true
      } catch (requestError: unknown) {
        setGuestError(
          isNormalizedApiError(requestError)
            ? requestError.message
            : 'Nao foi possivel adicionar este convidado.',
        )
        return false
      } finally {
        setIsAddingGuest(false)
      }
    },
    [canManageMatch, isAddingGuest, loadData, matchId],
  )

  const deleteMatch = useCallback(async () => {
    if (matchId === null || !canManageMatch || isDeletingMatch) {
      return false
    }

    setDeleteMatchError(null)
    setIsDeletingMatch(true)

    try {
      await matchesApi.deleteMatch(matchId)
      return true
    } catch (requestError: unknown) {
      setDeleteMatchError(
        isNormalizedApiError(requestError)
          ? requestError.message
          : 'Nao foi possivel excluir esta partida.',
      )
      return false
    } finally {
      setIsDeletingMatch(false)
    }
  }, [canManageMatch, isDeletingMatch, matchId])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearActionFeedback = useCallback(() => {
    setActionError(null)
    setActionNotice(null)
  }, [])

  const clearGuestFeedback = useCallback(() => {
    setGuestError(null)
    setGuestNotice(null)
  }, [])

  const clearDeleteMatchFeedback = useCallback(() => {
    setDeleteMatchError(null)
  }, [])

  useEffect(() => {
    setActionError(null)
    setActionNotice(null)
    setGuestError(null)
    setGuestNotice(null)
    setDeleteMatchError(null)
    setActiveAction(null)
    setIsSubmittingAction(false)
    setIsAddingGuest(false)
    setIsDeletingMatch(false)
    void loadData('initial')
  }, [loadData])

  return useMemo(
    () => ({
      match,
      userAttendanceStatus,
      canManageMatch,
      status,
      error,
      actionError,
      actionNotice,
      activeAction,
      guestError,
      guestNotice,
      deleteMatchError,
      isLoading,
      isRefreshing,
      isSubmittingAction,
      isAddingGuest,
      isDeletingMatch,
      refresh,
      confirmPresence,
      cancelPresence,
      markAbsent,
      cancelAbsent,
      addGuest,
      deleteMatch,
      clearError,
      clearActionFeedback,
      clearGuestFeedback,
      clearDeleteMatchFeedback,
    }),
    [
      activeAction,
      addGuest,
      actionError,
      actionNotice,
      cancelAbsent,
      cancelPresence,
      canManageMatch,
      clearDeleteMatchFeedback,
      clearGuestFeedback,
      clearActionFeedback,
      clearError,
      confirmPresence,
      deleteMatch,
      deleteMatchError,
      error,
      guestError,
      guestNotice,
      isAddingGuest,
      isDeletingMatch,
      isLoading,
      isRefreshing,
      isSubmittingAction,
      markAbsent,
      match,
      refresh,
      status,
      userAttendanceStatus,
    ],
  )
}
