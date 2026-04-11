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

type MatchDetailLoadResult = {
  ok: boolean
  hasAuxiliaryFailure: boolean
}

export type UseMatchDetailDataResult = {
  match: MatchDetail | null
  userAttendanceStatus: MatchUserAttendanceStatus | null
  attendanceStatusIssue: string | null
  canManageMatch: boolean
  managementCapabilityIssue: string | null
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

function getAuxiliaryErrorMessage(
  kind: 'attendance' | 'management',
  requestError: unknown,
): string {
  const fallbackMessage =
    kind === 'attendance'
      ? 'Nao foi possivel determinar sua resposta atual nesta partida.'
      : 'Nao foi possivel validar suas permissoes administrativas nesta partida.'

  if (isNormalizedApiError(requestError)) {
    return `${fallbackMessage} ${requestError.message}`
  }

  return fallbackMessage
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

function getActionStatusFromKind(
  action: MatchPlayerActionKind,
): MatchUserAttendanceStatus {
  switch (action) {
    case 'confirmPresence':
      return 'CONFIRMADO'
    case 'cancelPresence':
      return 'NEUTRO'
    case 'markAbsent':
      return 'AUSENTE'
    case 'cancelAbsent':
      return 'NEUTRO'
  }
}

function buildPostMutationNotice(
  successMessage: string,
  loadResult: MatchDetailLoadResult,
): string {
  if (!loadResult.ok) {
    return `${successMessage} A acao foi concluida, mas nao foi possivel recarregar a partida agora.`
  }

  if (loadResult.hasAuxiliaryFailure) {
    return `${successMessage} O detalhe principal foi mantido, mas algumas validacoes auxiliares ainda nao puderam ser atualizadas agora.`
  }

  return successMessage
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
  const [attendanceStatusIssue, setAttendanceStatusIssue] = useState<string | null>(
    null,
  )
  const [canManageMatch, setCanManageMatch] = useState(false)
  const [managementCapabilityIssue, setManagementCapabilityIssue] =
    useState<string | null>(null)
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
    async (mode: LoadMode): Promise<MatchDetailLoadResult> => {
      if (matchId === null) {
        setMatch(null)
        setUserAttendanceStatus(null)
        setAttendanceStatusIssue(null)
        setCanManageMatch(false)
        setManagementCapabilityIssue(null)
        setError('Partida invalida para o modulo de partidas.')
        setStatus('error')
        setIsLoading(false)
        setIsRefreshing(false)
        return {
          ok: false,
          hasAuxiliaryFailure: false,
        }
      }

      if (mode === 'initial') {
        setMatch(null)
        setUserAttendanceStatus(null)
        setAttendanceStatusIssue(null)
        setCanManageMatch(false)
        setManagementCapabilityIssue(null)
        setIsLoading(true)
        setStatus('loading')
      } else {
        setIsRefreshing(true)
      }

      setError(null)
      setAttendanceStatusIssue(null)
      setManagementCapabilityIssue(null)

      try {
        const nextMatch = await matchesApi.getMatchDetails(matchId)
        setMatch(nextMatch)

        const [attendanceStatusResult, canManageResult] = await Promise.allSettled(
          [
            getCurrentUserAttendanceStatus(nextMatch.idGrupo, matchId),
            getCurrentUserCanManageMatch(nextMatch.idGrupo),
          ],
        )

        const nextAttendanceIssue =
          attendanceStatusResult.status === 'rejected'
            ? getAuxiliaryErrorMessage('attendance', attendanceStatusResult.reason)
            : null

        const nextManagementIssue =
          canManageResult.status === 'rejected'
            ? getAuxiliaryErrorMessage('management', canManageResult.reason)
            : null

        setUserAttendanceStatus(
          attendanceStatusResult.status === 'fulfilled'
            ? attendanceStatusResult.value
            : null,
        )
        setAttendanceStatusIssue(nextAttendanceIssue)
        setCanManageMatch(
          canManageResult.status === 'fulfilled' ? canManageResult.value : false,
        )
        setManagementCapabilityIssue(nextManagementIssue)
        setStatus('success')
        return {
          ok: true,
          hasAuxiliaryFailure:
            nextAttendanceIssue !== null || nextManagementIssue !== null,
        }
      } catch (requestError: unknown) {
        if (mode === 'initial') {
          setUserAttendanceStatus(null)
          setAttendanceStatusIssue(null)
          setCanManageMatch(false)
          setManagementCapabilityIssue(null)
          setStatus('error')
        } else {
          setStatus('success')
        }

        setError(getLoadErrorMessage(requestError))
        return {
          ok: false,
          hasAuxiliaryFailure: false,
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
        const result = await request()

        setUserAttendanceStatus(getActionStatusFromKind(action))
        setMatch((currentMatch) =>
          currentMatch
            ? {
                ...currentMatch,
                totalConfirmados: result.totalConfirmados,
                limiteVagas: result.limiteVagas,
              }
            : currentMatch,
        )

        const loadResult = await loadData('refresh')
        setError(null)
        setStatus('success')
        setActionNotice(
          buildPostMutationNotice(getActionNotice(action), loadResult),
        )
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
        const result = await matchesApi.addGuestToMatch(matchId, { nome: name })

        setMatch((currentMatch) =>
          currentMatch
            ? {
                ...currentMatch,
                totalConfirmados: result.totalConfirmados,
                limiteVagas: result.limiteVagas,
              }
            : currentMatch,
        )

        const loadResult = await loadData('refresh')
        setError(null)
        setStatus('success')
        setGuestNotice(
          buildPostMutationNotice('Convidado adicionado com sucesso.', loadResult),
        )
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
    setAttendanceStatusIssue(null)
    setManagementCapabilityIssue(null)
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
      attendanceStatusIssue,
      canManageMatch,
      managementCapabilityIssue,
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
      attendanceStatusIssue,
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
      managementCapabilityIssue,
      markAbsent,
      match,
      refresh,
      status,
      userAttendanceStatus,
    ],
  )
}
