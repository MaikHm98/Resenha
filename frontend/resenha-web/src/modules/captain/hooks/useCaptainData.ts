import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isNormalizedApiError } from '../../../shared/lib/api'
import { useAuth } from '../../auth/hooks/useAuth'
import { groupsApi } from '../../groups/api/groupsApi'
import { matchesApi } from '../../matches/api/matchesApi'
import type { Match } from '../../matches/types/matchesContracts'
import { captainApi } from '../api/captainApi'
import type {
  CaptainChallengeResult,
  CaptainPlayerSummary,
  CaptainStatus,
} from '../types/captainContracts'

type LoadMode = 'initial' | 'refresh'

export type CaptainDataStatus = 'idle' | 'loading' | 'success' | 'error'

export type UseCaptainDataResult = {
  captainStatus: CaptainStatus | null
  groupMatches: Match[]
  eligibleChallengers: CaptainPlayerSummary[]
  selectedMatchId: number | null
  status: CaptainDataStatus
  error: string | null
  openCycleError: string | null
  openCycleNotice: string | null
  matchesError: string | null
  eligibleError: string | null
  launchChallengeError: string | null
  launchChallengeNotice: string | null
  resultError: string | null
  resultNotice: string | null
  hasNoCycle: boolean
  isAdmin: boolean
  isCurrentCaptain: boolean
  isLoading: boolean
  isRefreshing: boolean
  isOpeningCycle: boolean
  isLoadingMatches: boolean
  isLoadingEligibleChallengers: boolean
  isLaunchingChallenge: boolean
  isRegisteringResult: boolean
  refresh: () => Promise<void>
  openCycle: () => Promise<boolean>
  selectMatch: (matchId: number | null) => void
  launchChallenge: (challengerUserId: number) => Promise<boolean>
  registerChallengeResult: (
    resultado: CaptainChallengeResult,
  ) => Promise<boolean>
  clearError: () => void
  clearOpenCycleFeedback: () => void
  clearLaunchChallengeFeedback: () => void
  clearResultFeedback: () => void
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

function isNoCycleRequestError(requestError: unknown): boolean {
  if (!isNormalizedApiError(requestError)) {
    return false
  }

  const normalizedMessage = normalizeTextForComparison(requestError.message)
  return normalizedMessage.includes('nao ha capitao ativo')
}

function parseSessionUserId(value: string | undefined): number | null {
  if (!value) {
    return null
  }

  const parsedValue = Number.parseInt(value, 10)
  return Number.isNaN(parsedValue) ? null : parsedValue
}

function canLoadLaunchContext(
  captainStatus: CaptainStatus | null,
  currentUserId: number | null,
): boolean {
  if (captainStatus === null || currentUserId === null) {
    return false
  }

  return (
    captainStatus.idCapitao === currentUserId &&
    captainStatus.idDesafiante === null
  )
}

export function useCaptainData(groupId: number | null): UseCaptainDataResult {
  const { session } = useAuth()
  const currentUserId = parseSessionUserId(session?.userId)

  const [captainStatus, setCaptainStatus] = useState<CaptainStatus | null>(null)
  const [groupMatches, setGroupMatches] = useState<Match[]>([])
  const [eligibleChallengers, setEligibleChallengers] = useState<
    CaptainPlayerSummary[]
  >([])
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null)
  const [status, setStatus] = useState<CaptainDataStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [openCycleError, setOpenCycleError] = useState<string | null>(null)
  const [openCycleNotice, setOpenCycleNotice] = useState<string | null>(null)
  const [matchesError, setMatchesError] = useState<string | null>(null)
  const [eligibleError, setEligibleError] = useState<string | null>(null)
  const [launchChallengeError, setLaunchChallengeError] = useState<string | null>(
    null,
  )
  const [launchChallengeNotice, setLaunchChallengeNotice] = useState<
    string | null
  >(null)
  const [resultError, setResultError] = useState<string | null>(null)
  const [resultNotice, setResultNotice] = useState<string | null>(null)
  const [hasNoCycle, setHasNoCycle] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isOpeningCycle, setIsOpeningCycle] = useState(false)
  const [isLoadingMatches, setIsLoadingMatches] = useState(false)
  const [isLoadingEligibleChallengers, setIsLoadingEligibleChallengers] =
    useState(false)
  const [isLaunchingChallenge, setIsLaunchingChallenge] = useState(false)
  const [isRegisteringResult, setIsRegisteringResult] = useState(false)
  const [eligibleReloadToken, setEligibleReloadToken] = useState(0)
  const captainStatusRef = useRef<CaptainStatus | null>(null)
  const hasNoCycleRef = useRef(false)
  const eligibleRequestIdRef = useRef(0)

  const isCurrentCaptain =
    captainStatus !== null &&
    currentUserId !== null &&
    captainStatus.idCapitao === currentUserId

  const shouldLoadLaunchChallengeContext = canLoadLaunchContext(
    captainStatus,
    currentUserId,
  )

  const loadData = useCallback(
    async (mode: LoadMode) => {
      if (groupId === null) {
        setCaptainStatus(null)
        setGroupMatches([])
        setEligibleChallengers([])
        setSelectedMatchId(null)
        setHasNoCycle(false)
        setIsAdmin(false)
        setMatchesError(null)
        setEligibleError(null)
        setIsLoadingMatches(false)
        setIsLoadingEligibleChallengers(false)
        setError('Grupo invalido para carregar o ciclo de capitao.')
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
      setMatchesError(null)

      try {
        const myGroups = await groupsApi.getMyGroups()
        const matchedGroup = myGroups.find((group) => group.idGrupo === groupId)

        if (!matchedGroup) {
          setCaptainStatus(null)
          setGroupMatches([])
          setEligibleChallengers([])
          setSelectedMatchId(null)
          setHasNoCycle(false)
          setIsAdmin(false)
          setMatchesError(null)
          setEligibleError(null)
          setIsLoadingMatches(false)
          setIsLoadingEligibleChallengers(false)
          setError('Grupo nao encontrado na sua lista de grupos.')
          setStatus('error')
          return
        }

        setIsAdmin(matchedGroup.perfil === 'ADMIN')

        try {
          const nextCaptainStatus = await captainApi.getCaptainStatus(groupId)
          setCaptainStatus(nextCaptainStatus)
          setHasNoCycle(false)
          setStatus('success')

          if (canLoadLaunchContext(nextCaptainStatus, currentUserId)) {
            setIsLoadingMatches(true)

            try {
              const nextMatches = await matchesApi.getGroupMatches(groupId)
              setGroupMatches(nextMatches)
            } catch (requestError: unknown) {
              setGroupMatches([])
              setSelectedMatchId(null)
              setEligibleChallengers([])
              setEligibleError(null)
              setMatchesError(
                readRequestError(
                  requestError,
                  'Nao foi possivel carregar as partidas do grupo para o fluxo de desafio.',
                ),
              )
            } finally {
              setIsLoadingMatches(false)
            }
          } else {
            setGroupMatches([])
            setSelectedMatchId(null)
            setEligibleChallengers([])
            setMatchesError(null)
            setEligibleError(null)
            setIsLoadingMatches(false)
          }
        } catch (requestError: unknown) {
          if (isNoCycleRequestError(requestError)) {
            setCaptainStatus(null)
            setGroupMatches([])
            setEligibleChallengers([])
            setSelectedMatchId(null)
            setHasNoCycle(true)
            setMatchesError(null)
            setEligibleError(null)
            setIsLoadingMatches(false)
            setIsLoadingEligibleChallengers(false)
            setStatus('success')
            return
          }

          throw requestError
        }
      } catch (requestError: unknown) {
        const nextError = readRequestError(
          requestError,
          'Nao foi possivel carregar os dados do ciclo de capitao.',
        )
        const hasRenderableState =
          captainStatusRef.current !== null || hasNoCycleRef.current

        if (mode === 'refresh' && hasRenderableState) {
          setError(nextError)
        } else {
          setCaptainStatus(null)
          setGroupMatches([])
          setEligibleChallengers([])
          setSelectedMatchId(null)
          setHasNoCycle(false)
          setMatchesError(null)
          setEligibleError(null)
          setIsLoadingMatches(false)
          setIsLoadingEligibleChallengers(false)
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
    [currentUserId, groupId],
  )

  const loadEligibleChallengers = useCallback(
    async (matchId: number) => {
      if (groupId === null || !shouldLoadLaunchChallengeContext) {
        eligibleRequestIdRef.current += 1
        setEligibleChallengers([])
        setEligibleError(null)
        setIsLoadingEligibleChallengers(false)
        return
      }

      const requestId = eligibleRequestIdRef.current + 1
      eligibleRequestIdRef.current = requestId
      setIsLoadingEligibleChallengers(true)
      setEligibleError(null)

      try {
        const nextEligibleChallengers =
          await captainApi.getEligibleChallengers(groupId, matchId)
        if (requestId === eligibleRequestIdRef.current) {
          setEligibleChallengers(nextEligibleChallengers)
        }
      } catch (requestError: unknown) {
        if (requestId === eligibleRequestIdRef.current) {
          setEligibleChallengers([])
          setEligibleError(
            readRequestError(
              requestError,
              'Nao foi possivel carregar os jogadores elegiveis desta partida.',
            ),
          )
        }
      } finally {
        if (requestId === eligibleRequestIdRef.current) {
          setIsLoadingEligibleChallengers(false)
        }
      }
    },
    [groupId, shouldLoadLaunchChallengeContext],
  )

  const refresh = useCallback(async () => {
    await loadData('refresh')
    if (selectedMatchId !== null) {
      setEligibleReloadToken((currentValue) => currentValue + 1)
    }
  }, [loadData, selectedMatchId])

  const openCycle = useCallback(async () => {
    if (groupId === null || !isAdmin || isOpeningCycle) {
      return false
    }

    setOpenCycleError(null)
    setOpenCycleNotice(null)
    setIsOpeningCycle(true)

    try {
      const nextCaptainStatus = await captainApi.drawCaptain(groupId)
      setCaptainStatus(nextCaptainStatus)
      setHasNoCycle(false)
      setStatus('success')
      setError(null)
      setOpenCycleNotice('Ciclo de capitao iniciado com sucesso.')
      await loadData('refresh')
      return true
    } catch (requestError: unknown) {
      setOpenCycleError(
        readRequestError(
          requestError,
          'Nao foi possivel iniciar o ciclo de capitao.',
        ),
      )
      return false
    } finally {
      setIsOpeningCycle(false)
    }
  }, [groupId, isAdmin, isOpeningCycle, loadData])

  const selectMatch = useCallback((matchId: number | null) => {
    eligibleRequestIdRef.current += 1
    setSelectedMatchId(matchId)
    setEligibleChallengers([])
    setEligibleError(null)
    setIsLoadingEligibleChallengers(false)
    setLaunchChallengeError(null)
    setLaunchChallengeNotice(null)
  }, [])

  const launchChallenge = useCallback(
    async (challengerUserId: number) => {
      if (
        groupId === null ||
        selectedMatchId === null ||
        !shouldLoadLaunchChallengeContext ||
        isLaunchingChallenge
      ) {
        return false
      }

      setLaunchChallengeError(null)
      setLaunchChallengeNotice(null)
      setIsLaunchingChallenge(true)

      try {
        const nextCaptainStatus = await captainApi.launchChallenge(groupId, {
          idDesafiante: challengerUserId,
          idPartida: selectedMatchId,
        })

        setCaptainStatus(nextCaptainStatus)
        setLaunchChallengeNotice('Desafiante definido com sucesso.')
        await loadData('refresh')
        return true
      } catch (requestError: unknown) {
        setLaunchChallengeError(
          readRequestError(
            requestError,
            'Nao foi possivel lancar o desafio para esta partida.',
          ),
        )
        return false
      } finally {
        setIsLaunchingChallenge(false)
      }
    },
    [groupId, isLaunchingChallenge, loadData, selectedMatchId, shouldLoadLaunchChallengeContext],
  )

  const registerChallengeResult = useCallback(
    async (resultado: CaptainChallengeResult) => {
      const hasPendingChallenge =
        captainStatus?.idDesafiante !== null && captainStatus?.nomeDesafiante !== null

      if (
        groupId === null ||
        !isAdmin ||
        !hasPendingChallenge ||
        isRegisteringResult
      ) {
        return false
      }

      setResultError(null)
      setResultNotice(null)
      setIsRegisteringResult(true)

      try {
        const nextCaptainStatus = await captainApi.registerChallengeResult(
          groupId,
          { resultado },
        )

        setCaptainStatus(nextCaptainStatus)
        setResultNotice('Resultado do desafio registrado com sucesso.')
        await loadData('refresh')
        return true
      } catch (requestError: unknown) {
        setResultError(
          readRequestError(
            requestError,
            'Nao foi possivel registrar o resultado deste desafio.',
          ),
        )
        return false
      } finally {
        setIsRegisteringResult(false)
      }
    },
    [captainStatus, groupId, isAdmin, isRegisteringResult, loadData],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearOpenCycleFeedback = useCallback(() => {
    setOpenCycleError(null)
    setOpenCycleNotice(null)
  }, [])

  const clearLaunchChallengeFeedback = useCallback(() => {
    setLaunchChallengeError(null)
    setLaunchChallengeNotice(null)
  }, [])

  const clearResultFeedback = useCallback(() => {
    setResultError(null)
    setResultNotice(null)
  }, [])

  useEffect(() => {
    captainStatusRef.current = captainStatus
  }, [captainStatus])

  useEffect(() => {
    hasNoCycleRef.current = hasNoCycle
  }, [hasNoCycle])

  useEffect(() => {
    if (!shouldLoadLaunchChallengeContext) {
      eligibleRequestIdRef.current += 1
      setGroupMatches([])
      setSelectedMatchId(null)
      setEligibleChallengers([])
      setMatchesError(null)
      setEligibleError(null)
      setIsLoadingEligibleChallengers(false)
    }
  }, [shouldLoadLaunchChallengeContext])

  useEffect(() => {
    if (!shouldLoadLaunchChallengeContext) {
      return
    }

    setSelectedMatchId((currentValue) => {
      if (
        currentValue !== null &&
        groupMatches.some((match) => match.idPartida === currentValue)
      ) {
        return currentValue
      }

      return null
    })
  }, [groupMatches, shouldLoadLaunchChallengeContext])

  useEffect(() => {
    if (!shouldLoadLaunchChallengeContext || selectedMatchId === null) {
      setEligibleChallengers([])
      setEligibleError(null)
      setIsLoadingEligibleChallengers(false)
      return
    }

    eligibleRequestIdRef.current += 1
    void loadEligibleChallengers(selectedMatchId)
  }, [
    eligibleReloadToken,
    loadEligibleChallengers,
    selectedMatchId,
    shouldLoadLaunchChallengeContext,
  ])

  useEffect(() => {
    setCaptainStatus(null)
    setGroupMatches([])
    setEligibleChallengers([])
    setSelectedMatchId(null)
    setStatus('idle')
    setError(null)
    setOpenCycleError(null)
    setOpenCycleNotice(null)
    setMatchesError(null)
    setEligibleError(null)
    setLaunchChallengeError(null)
    setLaunchChallengeNotice(null)
    setResultError(null)
    setResultNotice(null)
    setHasNoCycle(false)
    setIsAdmin(false)
    setIsLoadingMatches(false)
    setIsLoadingEligibleChallengers(false)
    setIsRegisteringResult(false)
    eligibleRequestIdRef.current += 1
    setEligibleReloadToken(0)
  }, [groupId])

  useEffect(() => {
    void loadData('initial')
  }, [loadData])

  return useMemo(
    () => ({
      captainStatus,
      groupMatches,
      eligibleChallengers,
      selectedMatchId,
      status,
      error,
      openCycleError,
      openCycleNotice,
      matchesError,
      eligibleError,
      launchChallengeError,
      launchChallengeNotice,
      resultError,
      resultNotice,
      hasNoCycle,
      isAdmin,
      isCurrentCaptain,
      isLoading,
      isRefreshing,
      isOpeningCycle,
      isLoadingMatches,
      isLoadingEligibleChallengers,
      isLaunchingChallenge,
      isRegisteringResult,
      refresh,
      openCycle,
      selectMatch,
      launchChallenge,
      registerChallengeResult,
      clearError,
      clearOpenCycleFeedback,
      clearLaunchChallengeFeedback,
      clearResultFeedback,
    }),
    [
      captainStatus,
      clearError,
      clearLaunchChallengeFeedback,
      clearOpenCycleFeedback,
      clearResultFeedback,
      eligibleChallengers,
      eligibleError,
      error,
      groupMatches,
      hasNoCycle,
      isAdmin,
      isCurrentCaptain,
      isLaunchingChallenge,
      isLoading,
      isLoadingEligibleChallengers,
      isLoadingMatches,
      isOpeningCycle,
      isRegisteringResult,
      isRefreshing,
      launchChallenge,
      launchChallengeError,
      launchChallengeNotice,
      matchesError,
      openCycle,
      openCycleError,
      openCycleNotice,
      refresh,
      registerChallengeResult,
      resultError,
      resultNotice,
      selectMatch,
      selectedMatchId,
      status,
    ],
  )
}
