import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isNormalizedApiError } from '../../../shared/lib/api'
import { groupsApi } from '../../groups/api/groupsApi'
import { matchesApi } from '../api/matchesApi'
import type { MatchVoteStatus, MatchVoteType } from '../types/voteContracts'

type LoadMode = 'initial' | 'refresh'

export type MatchVoteDataStatus = 'idle' | 'loading' | 'success' | 'error'

export type UseMatchVoteDataResult = {
  voteStatus: MatchVoteStatus | null
  canManageVoting: boolean
  hasVotingStarted: boolean
  status: MatchVoteDataStatus
  error: string | null
  voteError: string | null
  voteNotice: string | null
  closeVoteError: string | null
  closeVoteNotice: string | null
  approveVoteError: string | null
  approveVoteNotice: string | null
  openVotingError: string | null
  openVotingNotice: string | null
  activeVoteType: MatchVoteType | null
  activeVoteCandidateUserId: number | null
  activeCloseVoteType: MatchVoteType | null
  activeApproveVoteType: MatchVoteType | null
  isLoading: boolean
  isRefreshing: boolean
  isCastingVote: boolean
  isClosingVote: boolean
  isApprovingVote: boolean
  isOpeningVoting: boolean
  refresh: () => Promise<void>
  castVote: (
    type: MatchVoteType,
    candidateUserId: number,
    candidateName: string,
  ) => Promise<boolean>
  closeVote: (type: MatchVoteType) => Promise<boolean>
  approveVote: (type: MatchVoteType) => Promise<boolean>
  openVoting: () => Promise<boolean>
  clearError: () => void
  clearVoteFeedback: () => void
  clearCloseVoteFeedback: () => void
  clearApproveVoteFeedback: () => void
  clearOpenVotingFeedback: () => void
}

function getLoadErrorMessage(requestError: unknown): string {
  if (isNormalizedApiError(requestError)) {
    return requestError.message
  }

  return 'Nao foi possivel carregar o status da votacao.'
}

function getOpenVotingErrorMessage(requestError: unknown): string {
  if (isNormalizedApiError(requestError)) {
    return requestError.message
  }

  return 'Nao foi possivel abrir a votacao desta partida.'
}

function getVoteErrorMessage(requestError: unknown): string {
  if (isNormalizedApiError(requestError)) {
    return requestError.message
  }

  return 'Nao foi possivel registrar este voto.'
}

function getCloseVoteErrorMessage(requestError: unknown): string {
  if (isNormalizedApiError(requestError)) {
    return requestError.message
  }

  return 'Nao foi possivel encerrar ou apurar esta rodada.'
}

function getApproveVoteErrorMessage(requestError: unknown): string {
  if (isNormalizedApiError(requestError)) {
    return requestError.message
  }

  return 'Nao foi possivel aprovar o resultado final desta votacao.'
}

async function getCurrentUserCanManageVoting(matchId: number): Promise<boolean> {
  const match = await matchesApi.getMatchDetails(matchId)
  const myGroups = await groupsApi.getMyGroups()
  const currentGroup = myGroups.find((group) => group.idGrupo === match.idGrupo)

  return currentGroup?.perfil === 'ADMIN'
}

function hasVotingStartedSnapshot(voteStatus: MatchVoteStatus | null): boolean {
  if (voteStatus === null) {
    return false
  }

  return (
    voteStatus.mvp !== null ||
    voteStatus.bolaMurcha !== null ||
    voteStatus.mvpHistorico.length > 0 ||
    voteStatus.bolaMurchaHistorico.length > 0
  )
}

export function useMatchVoteData(
  matchId: number | null,
): UseMatchVoteDataResult {
  const [voteStatus, setVoteStatus] = useState<MatchVoteStatus | null>(null)
  const [canManageVoting, setCanManageVoting] = useState(false)
  const [status, setStatus] = useState<MatchVoteDataStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [voteError, setVoteError] = useState<string | null>(null)
  const [voteNotice, setVoteNotice] = useState<string | null>(null)
  const [closeVoteError, setCloseVoteError] = useState<string | null>(null)
  const [closeVoteNotice, setCloseVoteNotice] = useState<string | null>(null)
  const [approveVoteError, setApproveVoteError] = useState<string | null>(null)
  const [approveVoteNotice, setApproveVoteNotice] = useState<string | null>(null)
  const [openVotingError, setOpenVotingError] = useState<string | null>(null)
  const [openVotingNotice, setOpenVotingNotice] = useState<string | null>(null)
  const [activeVoteType, setActiveVoteType] = useState<MatchVoteType | null>(null)
  const [activeVoteCandidateUserId, setActiveVoteCandidateUserId] = useState<number | null>(null)
  const [activeCloseVoteType, setActiveCloseVoteType] = useState<MatchVoteType | null>(null)
  const [activeApproveVoteType, setActiveApproveVoteType] = useState<MatchVoteType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCastingVote, setIsCastingVote] = useState(false)
  const [isClosingVote, setIsClosingVote] = useState(false)
  const [isApprovingVote, setIsApprovingVote] = useState(false)
  const [isOpeningVoting, setIsOpeningVoting] = useState(false)
  const voteStatusRef = useRef<MatchVoteStatus | null>(null)

  const loadData = useCallback(
    async (mode: LoadMode) => {
      if (matchId === null) {
        setVoteStatus(null)
        setCanManageVoting(false)
        setError('Partida invalida para o modulo de votacao.')
        setStatus('error')
        setIsLoading(false)
        setIsRefreshing(false)
        return
      }

      if (mode === 'initial') {
        setVoteStatus(null)
        setCanManageVoting(false)
        setIsLoading(true)
        setStatus('loading')
      } else {
        setIsRefreshing(true)
      }

      setError(null)

      try {
        const nextVoteStatus = await matchesApi.getMatchVoteStatus(matchId)
        setVoteStatus(nextVoteStatus)
        setStatus('success')

        try {
          const nextCanManageVoting = await getCurrentUserCanManageVoting(matchId)
          setCanManageVoting(nextCanManageVoting)
        } catch {
          setCanManageVoting(false)
        }
      } catch (requestError: unknown) {
        const nextError = getLoadErrorMessage(requestError)

        if (mode === 'refresh' && voteStatusRef.current !== null) {
          setError(nextError)
        } else {
          setVoteStatus(null)
          setCanManageVoting(false)
          setError(nextError)
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

  const castVote = useCallback(
    async (
      type: MatchVoteType,
      candidateUserId: number,
      candidateName: string,
    ) => {
      if (matchId === null || isCastingVote) {
        return false
      }

      setVoteError(null)
      setVoteNotice(null)
      setIsCastingVote(true)
      setActiveVoteType(type)
      setActiveVoteCandidateUserId(candidateUserId)

      try {
        const nextVoteStatus = await matchesApi.castMatchVote(matchId, {
          tipo: type,
          idUsuarioVotado: candidateUserId,
        })
        setVoteStatus(nextVoteStatus)
        setVoteNotice(`Voto em ${type} registrado para ${candidateName}.`)
        await loadData('refresh')
        return true
      } catch (requestError: unknown) {
        setVoteError(getVoteErrorMessage(requestError))
        return false
      } finally {
        setIsCastingVote(false)
        setActiveVoteType(null)
        setActiveVoteCandidateUserId(null)
      }
    },
    [isCastingVote, loadData, matchId],
  )

  const closeVote = useCallback(
    async (type: MatchVoteType) => {
      if (matchId === null || isClosingVote || !canManageVoting) {
        return false
      }

      setCloseVoteError(null)
      setCloseVoteNotice(null)
      setIsClosingVote(true)
      setActiveCloseVoteType(type)

      try {
        const nextVoteStatus = await matchesApi.closeMatchVote(matchId, {
          tipo: type,
        })
        setVoteStatus(nextVoteStatus)
        setCloseVoteNotice(
          `Rodada de ${type} encerrada/apurada. O snapshot foi atualizado com o retorno do backend.`,
        )
        await loadData('refresh')
        return true
      } catch (requestError: unknown) {
        setCloseVoteError(getCloseVoteErrorMessage(requestError))
        return false
      } finally {
        setIsClosingVote(false)
        setActiveCloseVoteType(null)
      }
    },
    [canManageVoting, isClosingVote, loadData, matchId],
  )

  const approveVote = useCallback(
    async (type: MatchVoteType) => {
      if (matchId === null || isApprovingVote || !canManageVoting) {
        return false
      }

      setApproveVoteError(null)
      setApproveVoteNotice(null)
      setIsApprovingVote(true)
      setActiveApproveVoteType(type)

      try {
        const nextVoteStatus = await matchesApi.approveMatchVote(matchId, {
          tipo: type,
        })
        setVoteStatus(nextVoteStatus)
        setApproveVoteNotice(
          `Resultado final de ${type} aprovado. O snapshot foi recarregado a partir do backend.`,
        )
        await loadData('refresh')
        return true
      } catch (requestError: unknown) {
        setApproveVoteError(getApproveVoteErrorMessage(requestError))
        return false
      } finally {
        setIsApprovingVote(false)
        setActiveApproveVoteType(null)
      }
    },
    [canManageVoting, isApprovingVote, loadData, matchId],
  )

  const openVoting = useCallback(async () => {
    if (matchId === null || isOpeningVoting || !canManageVoting) {
      return false
    }

    setOpenVotingError(null)
    setOpenVotingNotice(null)
    setIsOpeningVoting(true)

    try {
      const nextVoteStatus = await matchesApi.openMatchVoting(matchId)
      setVoteStatus(nextVoteStatus)
      setOpenVotingNotice('Votacao aberta com sucesso para MVP e Bola Murcha.')
      await loadData('refresh')
      return true
    } catch (requestError: unknown) {
      setOpenVotingError(getOpenVotingErrorMessage(requestError))
      return false
    } finally {
      setIsOpeningVoting(false)
    }
  }, [canManageVoting, isOpeningVoting, loadData, matchId])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearVoteFeedback = useCallback(() => {
    setVoteError(null)
    setVoteNotice(null)
  }, [])

  const clearCloseVoteFeedback = useCallback(() => {
    setCloseVoteError(null)
    setCloseVoteNotice(null)
  }, [])

  const clearApproveVoteFeedback = useCallback(() => {
    setApproveVoteError(null)
    setApproveVoteNotice(null)
  }, [])

  const clearOpenVotingFeedback = useCallback(() => {
    setOpenVotingError(null)
    setOpenVotingNotice(null)
  }, [])

  useEffect(() => {
    voteStatusRef.current = voteStatus
  }, [voteStatus])

  useEffect(() => {
    setError(null)
    setVoteError(null)
    setVoteNotice(null)
    setCloseVoteError(null)
    setCloseVoteNotice(null)
    setApproveVoteError(null)
    setApproveVoteNotice(null)
    setOpenVotingError(null)
    setOpenVotingNotice(null)
    setActiveVoteType(null)
    setActiveVoteCandidateUserId(null)
    setActiveCloseVoteType(null)
    setActiveApproveVoteType(null)
    setIsCastingVote(false)
    setIsClosingVote(false)
    setIsApprovingVote(false)
    setIsOpeningVoting(false)
    void loadData('initial')
  }, [loadData])

  const hasVotingStarted = hasVotingStartedSnapshot(voteStatus)

  return useMemo(
    () => ({
      voteStatus,
      canManageVoting,
      hasVotingStarted,
      status,
      error,
      voteError,
      voteNotice,
      closeVoteError,
      closeVoteNotice,
      approveVoteError,
      approveVoteNotice,
      openVotingError,
      openVotingNotice,
      activeVoteType,
      activeVoteCandidateUserId,
      activeCloseVoteType,
      activeApproveVoteType,
      isLoading,
      isRefreshing,
      isCastingVote,
      isClosingVote,
      isApprovingVote,
      isOpeningVoting,
      refresh,
      castVote,
      closeVote,
      approveVote,
      openVoting,
      clearError,
      clearVoteFeedback,
      clearCloseVoteFeedback,
      clearApproveVoteFeedback,
      clearOpenVotingFeedback,
    }),
    [
      activeApproveVoteType,
      activeCloseVoteType,
      activeVoteCandidateUserId,
      activeVoteType,
      approveVote,
      approveVoteError,
      approveVoteNotice,
      castVote,
      canManageVoting,
      clearApproveVoteFeedback,
      clearError,
      clearCloseVoteFeedback,
      clearVoteFeedback,
      clearOpenVotingFeedback,
      closeVote,
      closeVoteError,
      closeVoteNotice,
      error,
      hasVotingStarted,
      isCastingVote,
      isApprovingVote,
      isClosingVote,
      isLoading,
      isOpeningVoting,
      isRefreshing,
      openVoting,
      openVotingError,
      openVotingNotice,
      refresh,
      status,
      voteError,
      voteNotice,
      voteStatus,
    ],
  )
}
