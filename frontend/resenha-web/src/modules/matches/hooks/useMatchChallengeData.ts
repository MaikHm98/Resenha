import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isNormalizedApiError } from '../../../shared/lib/api'
import { matchesApi } from '../api/matchesApi'
import type {
  MatchChallengeParity,
  MatchChallengePlayer,
  MatchChallengeStatus,
} from '../types/challengeContracts'

type LoadMode = 'initial' | 'refresh'
type MatchChallengeLineDrawActionKind = 'startLineDraw' | 'submitLineDrawNumber'
type MatchChallengeGoalkeeperActionKind =
  | 'startGoalkeeperDraw'
  | 'submitGoalkeeperDrawNumber'

export type MatchChallengeDataStatus = 'idle' | 'loading' | 'success' | 'error'

type MatchChallengeLoadResult = {
  ok: boolean
}

export type UseMatchChallengeDataResult = {
  challenge: MatchChallengeStatus | null
  status: MatchChallengeDataStatus
  error: string | null
  lineDrawError: string | null
  lineDrawNotice: string | null
  linePickError: string | null
  linePickNotice: string | null
  goalkeeperError: string | null
  goalkeeperNotice: string | null
  activeLineDrawAction: MatchChallengeLineDrawActionKind | null
  activeGoalkeeperAction: MatchChallengeGoalkeeperActionKind | null
  activeLinePickPlayerId: number | null
  activeGoalkeeperPickPlayerId: number | null
  isLoading: boolean
  isRefreshing: boolean
  isSubmittingLineDraw: boolean
  isPickingLinePlayer: boolean
  isSubmittingGoalkeeper: boolean
  isPickingGoalkeeper: boolean
  refresh: () => Promise<void>
  startLineDraw: (parity: MatchChallengeParity) => Promise<boolean>
  submitLineDrawNumber: (number: number) => Promise<boolean>
  pickLinePlayer: (player: MatchChallengePlayer) => Promise<boolean>
  startGoalkeeperDraw: (parity: MatchChallengeParity) => Promise<boolean>
  submitGoalkeeperDrawNumber: (number: number) => Promise<boolean>
  pickGoalkeeper: (player: MatchChallengePlayer) => Promise<boolean>
  clearError: () => void
  clearLineDrawFeedback: () => void
  clearLinePickFeedback: () => void
  clearGoalkeeperFeedback: () => void
}

function getLoadErrorMessage(requestError: unknown): string {
  if (isNormalizedApiError(requestError)) {
    return requestError.message
  }

  return 'Nao foi possivel carregar o snapshot do desafio.'
}

function getLineDrawActionErrorMessage(
  action: MatchChallengeLineDrawActionKind,
  requestError: unknown,
): string {
  if (isNormalizedApiError(requestError)) {
    return requestError.message
  }

  if (action === 'startLineDraw') {
    return 'Nao foi possivel iniciar o par ou impar da linha.'
  }

  return 'Nao foi possivel informar o numero da linha.'
}

function getLineDrawActionNotice(
  action: MatchChallengeLineDrawActionKind,
): string {
  if (action === 'startLineDraw') {
    return 'Paridade da linha atualizada com sucesso.'
  }

  return 'Numero da linha informado com sucesso.'
}

function getGoalkeeperActionErrorMessage(
  action: MatchChallengeGoalkeeperActionKind,
  requestError: unknown,
): string {
  if (isNormalizedApiError(requestError)) {
    return requestError.message
  }

  if (action === 'startGoalkeeperDraw') {
    return 'Nao foi possivel iniciar o par ou impar dos goleiros.'
  }

  return 'Nao foi possivel informar o numero dos goleiros.'
}

function getGoalkeeperActionNotice(
  action: MatchChallengeGoalkeeperActionKind,
): string {
  if (action === 'startGoalkeeperDraw') {
    return 'Paridade dos goleiros atualizada com sucesso.'
  }

  return 'Numero dos goleiros informado com sucesso.'
}

function buildPostMutationNotice(
  successMessage: string,
  loadResult: MatchChallengeLoadResult,
): string {
  if (!loadResult.ok) {
    return `${successMessage} O snapshot principal foi atualizado, mas nao foi possivel recarregar o desafio agora.`
  }

  return successMessage
}

export function useMatchChallengeData(
  matchId: number | null,
): UseMatchChallengeDataResult {
  const [challenge, setChallenge] = useState<MatchChallengeStatus | null>(null)
  const [status, setStatus] = useState<MatchChallengeDataStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [lineDrawError, setLineDrawError] = useState<string | null>(null)
  const [lineDrawNotice, setLineDrawNotice] = useState<string | null>(null)
  const [linePickError, setLinePickError] = useState<string | null>(null)
  const [linePickNotice, setLinePickNotice] = useState<string | null>(null)
  const [goalkeeperError, setGoalkeeperError] = useState<string | null>(null)
  const [goalkeeperNotice, setGoalkeeperNotice] = useState<string | null>(null)
  const [activeLineDrawAction, setActiveLineDrawAction] =
    useState<MatchChallengeLineDrawActionKind | null>(null)
  const [activeGoalkeeperAction, setActiveGoalkeeperAction] =
    useState<MatchChallengeGoalkeeperActionKind | null>(null)
  const [activeLinePickPlayerId, setActiveLinePickPlayerId] = useState<number | null>(
    null,
  )
  const [activeGoalkeeperPickPlayerId, setActiveGoalkeeperPickPlayerId] =
    useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSubmittingLineDraw, setIsSubmittingLineDraw] = useState(false)
  const [isPickingLinePlayer, setIsPickingLinePlayer] = useState(false)
  const [isSubmittingGoalkeeper, setIsSubmittingGoalkeeper] = useState(false)
  const [isPickingGoalkeeper, setIsPickingGoalkeeper] = useState(false)
  const challengeRef = useRef<MatchChallengeStatus | null>(null)

  const loadData = useCallback(
    async (mode: LoadMode): Promise<MatchChallengeLoadResult> => {
      if (matchId === null) {
        setChallenge(null)
        setError('Partida invalida para o modulo de desafio.')
        setStatus('error')
        setIsLoading(false)
        setIsRefreshing(false)
        return { ok: false }
      }

      if (mode === 'initial') {
        setChallenge(null)
        setIsLoading(true)
        setStatus('loading')
      } else {
        setIsRefreshing(true)
      }

      setError(null)

      try {
        const nextChallenge = await matchesApi.getMatchChallengeStatus(matchId)
        setChallenge(nextChallenge)
        setStatus('success')
        return { ok: true }
      } catch (requestError: unknown) {
        const nextError = getLoadErrorMessage(requestError)

        if (mode === 'refresh' && challengeRef.current !== null) {
          setError(nextError)
          setStatus('success')
        } else {
          setChallenge(null)
          setError(nextError)
          setStatus('error')
        }

        return { ok: false }
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

  const runLineDrawAction = useCallback(
    async (
      action: MatchChallengeLineDrawActionKind,
      request: () => Promise<MatchChallengeStatus>,
    ) => {
      if (matchId === null || isSubmittingLineDraw) {
        return false
      }

      setLineDrawError(null)
      setLineDrawNotice(null)
      setIsSubmittingLineDraw(true)
      setActiveLineDrawAction(action)

      try {
        const nextChallenge = await request()
        setChallenge(nextChallenge)
        challengeRef.current = nextChallenge
        const loadResult = await loadData('refresh')
        setError(null)
        setStatus('success')
        setLineDrawNotice(
          buildPostMutationNotice(getLineDrawActionNotice(action), loadResult),
        )
        return true
      } catch (requestError: unknown) {
        setLineDrawError(getLineDrawActionErrorMessage(action, requestError))
        return false
      } finally {
        setIsSubmittingLineDraw(false)
        setActiveLineDrawAction(null)
      }
    },
    [isSubmittingLineDraw, loadData, matchId],
  )

  const startLineDraw = useCallback(
    async (parity: MatchChallengeParity) => {
      return runLineDrawAction('startLineDraw', async () => {
        if (matchId === null) {
          throw new Error('Partida invalida.')
        }

        return matchesApi.startLineDraw(matchId, {
          escolhaParidade: parity,
        })
      })
    },
    [matchId, runLineDrawAction],
  )

  const submitLineDrawNumber = useCallback(
    async (number: number) => {
      return runLineDrawAction('submitLineDrawNumber', async () => {
        if (matchId === null) {
          throw new Error('Partida invalida.')
        }

        return matchesApi.submitLineDrawNumber(matchId, {
          numero: number,
        })
      })
    },
    [matchId, runLineDrawAction],
  )

  const runGoalkeeperAction = useCallback(
    async (
      action: MatchChallengeGoalkeeperActionKind,
      request: () => Promise<MatchChallengeStatus>,
    ) => {
      if (
        matchId === null ||
        isSubmittingGoalkeeper ||
        challenge?.statusDesafio === 'DEFINICAO_MANUAL_GOLEIRO' ||
        challenge?.requerDefinicaoManualGoleiro
      ) {
        return false
      }

      setGoalkeeperError(null)
      setGoalkeeperNotice(null)
      setIsSubmittingGoalkeeper(true)
      setActiveGoalkeeperAction(action)

      try {
        const nextChallenge = await request()
        setChallenge(nextChallenge)
        challengeRef.current = nextChallenge
        const loadResult = await loadData('refresh')
        setError(null)
        setStatus('success')
        setGoalkeeperNotice(
          buildPostMutationNotice(
            getGoalkeeperActionNotice(action),
            loadResult,
          ),
        )
        return true
      } catch (requestError: unknown) {
        setGoalkeeperError(
          getGoalkeeperActionErrorMessage(action, requestError),
        )
        return false
      } finally {
        setIsSubmittingGoalkeeper(false)
        setActiveGoalkeeperAction(null)
      }
    },
    [
      challenge?.requerDefinicaoManualGoleiro,
      challenge?.statusDesafio,
      isSubmittingGoalkeeper,
      loadData,
      matchId,
    ],
  )

  const startGoalkeeperDraw = useCallback(
    async (parity: MatchChallengeParity) => {
      return runGoalkeeperAction('startGoalkeeperDraw', async () => {
        if (matchId === null) {
          throw new Error('Partida invalida.')
        }

        return matchesApi.startGoalkeeperDraw(matchId, {
          escolhaParidade: parity,
        })
      })
    },
    [matchId, runGoalkeeperAction],
  )

  const submitGoalkeeperDrawNumber = useCallback(
    async (number: number) => {
      return runGoalkeeperAction('submitGoalkeeperDrawNumber', async () => {
        if (matchId === null) {
          throw new Error('Partida invalida.')
        }

        return matchesApi.submitGoalkeeperDrawNumber(matchId, {
          numero: number,
        })
      })
    },
    [matchId, runGoalkeeperAction],
  )

  const pickLinePlayer = useCallback(
    async (player: MatchChallengePlayer) => {
      if (
        matchId === null ||
        !challenge?.usuarioPodeEscolherJogadorLinha ||
        isPickingLinePlayer
      ) {
        return false
      }

      setLinePickError(null)
      setLinePickNotice(null)
      setIsPickingLinePlayer(true)
      setActiveLinePickPlayerId(player.idUsuario)

      try {
        const nextChallenge = await matchesApi.pickLinePlayer(matchId, {
          idUsuarioJogador: player.idUsuario,
        })

        setChallenge(nextChallenge)
        challengeRef.current = nextChallenge
        const loadResult = await loadData('refresh')
        setError(null)
        setStatus('success')
        setLinePickNotice(
          buildPostMutationNotice(
            `Pick registrado para ${player.nome}.`,
            loadResult,
          ),
        )
        return true
      } catch (requestError: unknown) {
        setLinePickError(
          isNormalizedApiError(requestError)
            ? requestError.message
            : `Nao foi possivel registrar o pick de ${player.nome}.`,
        )
        return false
      } finally {
        setIsPickingLinePlayer(false)
        setActiveLinePickPlayerId(null)
      }
    },
    [challenge?.usuarioPodeEscolherJogadorLinha, isPickingLinePlayer, loadData, matchId],
  )

  const pickGoalkeeper = useCallback(
    async (player: MatchChallengePlayer) => {
      if (
        matchId === null ||
        !challenge?.usuarioPodeEscolherGoleiro ||
        challenge.statusDesafio === 'DEFINICAO_MANUAL_GOLEIRO' ||
        challenge.requerDefinicaoManualGoleiro ||
        isPickingGoalkeeper
      ) {
        return false
      }

      setGoalkeeperError(null)
      setGoalkeeperNotice(null)
      setIsPickingGoalkeeper(true)
      setActiveGoalkeeperPickPlayerId(player.idUsuario)

      try {
        const nextChallenge = await matchesApi.pickGoalkeeper(matchId, {
          idUsuarioGoleiro: player.idUsuario,
        })

        setChallenge(nextChallenge)
        challengeRef.current = nextChallenge
        const loadResult = await loadData('refresh')
        setError(null)
        setStatus('success')
        setGoalkeeperNotice(
          buildPostMutationNotice(
            `Goleiro ${player.nome} escolhido com sucesso.`,
            loadResult,
          ),
        )
        return true
      } catch (requestError: unknown) {
        setGoalkeeperError(
          isNormalizedApiError(requestError)
            ? requestError.message
            : `Nao foi possivel escolher o goleiro ${player.nome}.`,
        )
        return false
      } finally {
        setIsPickingGoalkeeper(false)
        setActiveGoalkeeperPickPlayerId(null)
      }
    },
    [
      challenge?.requerDefinicaoManualGoleiro,
      challenge?.statusDesafio,
      challenge?.usuarioPodeEscolherGoleiro,
      isPickingGoalkeeper,
      loadData,
      matchId,
    ],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearLineDrawFeedback = useCallback(() => {
    setLineDrawError(null)
    setLineDrawNotice(null)
  }, [])

  const clearLinePickFeedback = useCallback(() => {
    setLinePickError(null)
    setLinePickNotice(null)
  }, [])

  const clearGoalkeeperFeedback = useCallback(() => {
    setGoalkeeperError(null)
    setGoalkeeperNotice(null)
  }, [])

  useEffect(() => {
    challengeRef.current = challenge
  }, [challenge])

  useEffect(() => {
    setError(null)
    setLineDrawError(null)
    setLineDrawNotice(null)
    setLinePickError(null)
    setLinePickNotice(null)
    setGoalkeeperError(null)
    setGoalkeeperNotice(null)
    setActiveLineDrawAction(null)
    setActiveGoalkeeperAction(null)
    setActiveLinePickPlayerId(null)
    setActiveGoalkeeperPickPlayerId(null)
    setIsSubmittingLineDraw(false)
    setIsPickingLinePlayer(false)
    setIsSubmittingGoalkeeper(false)
    setIsPickingGoalkeeper(false)
    void loadData('initial')
  }, [loadData])

  return useMemo(
    () => ({
      challenge,
      status,
      error,
      lineDrawError,
      lineDrawNotice,
      linePickError,
      linePickNotice,
      goalkeeperError,
      goalkeeperNotice,
      activeLineDrawAction,
      activeGoalkeeperAction,
      activeLinePickPlayerId,
      activeGoalkeeperPickPlayerId,
      isLoading,
      isRefreshing,
      isSubmittingLineDraw,
      isPickingLinePlayer,
      isSubmittingGoalkeeper,
      isPickingGoalkeeper,
      refresh,
      startLineDraw,
      submitLineDrawNumber,
      pickLinePlayer,
      startGoalkeeperDraw,
      submitGoalkeeperDrawNumber,
      pickGoalkeeper,
      clearError,
      clearLineDrawFeedback,
      clearLinePickFeedback,
      clearGoalkeeperFeedback,
    }),
    [
      activeGoalkeeperAction,
      activeGoalkeeperPickPlayerId,
      activeLineDrawAction,
      activeLinePickPlayerId,
      challenge,
      clearError,
      clearGoalkeeperFeedback,
      clearLineDrawFeedback,
      clearLinePickFeedback,
      error,
      goalkeeperError,
      goalkeeperNotice,
      isLoading,
      isPickingGoalkeeper,
      isPickingLinePlayer,
      isRefreshing,
      isSubmittingGoalkeeper,
      isSubmittingLineDraw,
      lineDrawError,
      lineDrawNotice,
      linePickError,
      linePickNotice,
      pickGoalkeeper,
      pickLinePlayer,
      refresh,
      startGoalkeeperDraw,
      startLineDraw,
      status,
      submitGoalkeeperDrawNumber,
      submitLineDrawNumber,
    ],
  )
}
