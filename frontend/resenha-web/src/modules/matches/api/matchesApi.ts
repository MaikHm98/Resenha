import { apiClient } from '../../../shared/lib/api'
import { mapMatchChallengeStatusApiToMatchChallengeStatus } from '../mappers/challengeMapper'
import {
  mapMatchApiToMatch,
  mapMatchDetailApiToMatchDetail,
  mapMatchPresenceApiToMatchPresenceResult,
  mapMessageApiToMessageResult,
} from '../mappers/matchesMapper'
import { mapMatchVoteStatusApiToMatchVoteStatus } from '../mappers/voteMapper'
import type {
  MatchChallengeStatus,
  MatchChallengeStatusApiResponse,
  PickMatchGoalkeeperInput,
  PickMatchLinePlayerInput,
  StartMatchGoalkeeperDrawInput,
  StartMatchLineDrawInput,
  SubmitMatchGoalkeeperDrawNumberInput,
  SubmitMatchLineDrawNumberInput,
} from '../types/challengeContracts'
import type {
  AddGuestToMatchInput,
  CreateMatchInput,
  Match,
  MatchApiResponse,
  MatchDetail,
  MatchDetailApiResponse,
  MatchPresenceApiResponse,
  MatchPresenceResult,
  MessageApiResponse,
  MessageResult,
} from '../types/matchesContracts'
import type {
  ApproveMatchVoteInput,
  CastMatchVoteInput,
  CloseMatchVoteInput,
  MatchVoteStatus,
  MatchVoteStatusApiResponse,
} from '../types/voteContracts'

const MATCHES_BASE_PATH = '/api/matches'
const GROUPS_BASE_PATH = '/api/groups'

async function createMatch(payload: CreateMatchInput): Promise<Match> {
  const response = await apiClient.post<MatchApiResponse>(
    MATCHES_BASE_PATH,
    payload,
  )
  return mapMatchApiToMatch(response.data)
}

async function getGroupMatches(groupId: number): Promise<Match[]> {
  const response = await apiClient.get<MatchApiResponse[]>(
    `${GROUPS_BASE_PATH}/${groupId}/matches`,
  )
  return response.data.map(mapMatchApiToMatch)
}

async function getMatchDetails(matchId: number): Promise<MatchDetail> {
  const response = await apiClient.get<MatchDetailApiResponse>(
    `${MATCHES_BASE_PATH}/${matchId}/details`,
  )
  return mapMatchDetailApiToMatchDetail(response.data)
}

async function confirmPresence(matchId: number): Promise<MatchPresenceResult> {
  const response = await apiClient.post<MatchPresenceApiResponse>(
    `${MATCHES_BASE_PATH}/${matchId}/confirm`,
  )
  return mapMatchPresenceApiToMatchPresenceResult(response.data)
}

async function cancelPresence(matchId: number): Promise<MatchPresenceResult> {
  const response = await apiClient.delete<MatchPresenceApiResponse>(
    `${MATCHES_BASE_PATH}/${matchId}/confirm`,
  )
  return mapMatchPresenceApiToMatchPresenceResult(response.data)
}

async function markAbsent(matchId: number): Promise<MatchPresenceResult> {
  const response = await apiClient.post<MatchPresenceApiResponse>(
    `${MATCHES_BASE_PATH}/${matchId}/absent`,
  )
  return mapMatchPresenceApiToMatchPresenceResult(response.data)
}

async function cancelAbsent(matchId: number): Promise<MatchPresenceResult> {
  const response = await apiClient.delete<MatchPresenceApiResponse>(
    `${MATCHES_BASE_PATH}/${matchId}/absent`,
  )
  return mapMatchPresenceApiToMatchPresenceResult(response.data)
}

async function addGuestToMatch(
  matchId: number,
  payload: AddGuestToMatchInput,
): Promise<MatchPresenceResult> {
  const response = await apiClient.post<MatchPresenceApiResponse>(
    `${MATCHES_BASE_PATH}/${matchId}/guests`,
    payload,
  )
  return mapMatchPresenceApiToMatchPresenceResult(response.data)
}

async function deleteMatch(matchId: number): Promise<MessageResult> {
  const response = await apiClient.delete<MessageApiResponse>(
    `${MATCHES_BASE_PATH}/${matchId}`,
  )
  return mapMessageApiToMessageResult(response.data)
}

async function getMatchChallengeStatus(
  matchId: number,
): Promise<MatchChallengeStatus> {
  const response = await apiClient.get<MatchChallengeStatusApiResponse>(
    `${MATCHES_BASE_PATH}/${matchId}/challenge-status`,
  )
  return mapMatchChallengeStatusApiToMatchChallengeStatus(response.data)
}

async function startLineDraw(
  matchId: number,
  payload: StartMatchLineDrawInput,
): Promise<MatchChallengeStatus> {
  const response = await apiClient.post<MatchChallengeStatusApiResponse>(
    `${MATCHES_BASE_PATH}/${matchId}/challenge/line-draw/start`,
    payload,
  )
  return mapMatchChallengeStatusApiToMatchChallengeStatus(response.data)
}

async function submitLineDrawNumber(
  matchId: number,
  payload: SubmitMatchLineDrawNumberInput,
): Promise<MatchChallengeStatus> {
  const response = await apiClient.post<MatchChallengeStatusApiResponse>(
    `${MATCHES_BASE_PATH}/${matchId}/challenge/line-draw/number`,
    payload,
  )
  return mapMatchChallengeStatusApiToMatchChallengeStatus(response.data)
}

async function pickLinePlayer(
  matchId: number,
  payload: PickMatchLinePlayerInput,
): Promise<MatchChallengeStatus> {
  const response = await apiClient.post<MatchChallengeStatusApiResponse>(
    `${MATCHES_BASE_PATH}/${matchId}/challenge/line-picks`,
    payload,
  )
  return mapMatchChallengeStatusApiToMatchChallengeStatus(response.data)
}

async function startGoalkeeperDraw(
  matchId: number,
  payload: StartMatchGoalkeeperDrawInput,
): Promise<MatchChallengeStatus> {
  const response = await apiClient.post<MatchChallengeStatusApiResponse>(
    `${MATCHES_BASE_PATH}/${matchId}/challenge/goalkeeper-draw/start`,
    payload,
  )
  return mapMatchChallengeStatusApiToMatchChallengeStatus(response.data)
}

async function submitGoalkeeperDrawNumber(
  matchId: number,
  payload: SubmitMatchGoalkeeperDrawNumberInput,
): Promise<MatchChallengeStatus> {
  const response = await apiClient.post<MatchChallengeStatusApiResponse>(
    `${MATCHES_BASE_PATH}/${matchId}/challenge/goalkeeper-draw/number`,
    payload,
  )
  return mapMatchChallengeStatusApiToMatchChallengeStatus(response.data)
}

async function pickGoalkeeper(
  matchId: number,
  payload: PickMatchGoalkeeperInput,
): Promise<MatchChallengeStatus> {
  const response = await apiClient.post<MatchChallengeStatusApiResponse>(
    `${MATCHES_BASE_PATH}/${matchId}/challenge/goalkeeper-pick`,
    payload,
  )
  return mapMatchChallengeStatusApiToMatchChallengeStatus(response.data)
}

async function getMatchVoteStatus(matchId: number): Promise<MatchVoteStatus> {
  const response = await apiClient.get<MatchVoteStatusApiResponse>(
    `${MATCHES_BASE_PATH}/${matchId}/vote`,
  )
  return mapMatchVoteStatusApiToMatchVoteStatus(response.data)
}

async function openMatchVoting(matchId: number): Promise<MatchVoteStatus> {
  const response = await apiClient.post<MatchVoteStatusApiResponse>(
    `${MATCHES_BASE_PATH}/${matchId}/vote/open`,
  )
  return mapMatchVoteStatusApiToMatchVoteStatus(response.data)
}

async function castMatchVote(
  matchId: number,
  payload: CastMatchVoteInput,
): Promise<MatchVoteStatus> {
  const response = await apiClient.post<MatchVoteStatusApiResponse>(
    `${MATCHES_BASE_PATH}/${matchId}/vote`,
    payload,
  )
  return mapMatchVoteStatusApiToMatchVoteStatus(response.data)
}

async function closeMatchVote(
  matchId: number,
  payload: CloseMatchVoteInput,
): Promise<MatchVoteStatus> {
  const response = await apiClient.post<MatchVoteStatusApiResponse>(
    `${MATCHES_BASE_PATH}/${matchId}/vote/close`,
    payload,
  )
  return mapMatchVoteStatusApiToMatchVoteStatus(response.data)
}

async function approveMatchVote(
  matchId: number,
  payload: ApproveMatchVoteInput,
): Promise<MatchVoteStatus> {
  const response = await apiClient.post<MatchVoteStatusApiResponse>(
    `${MATCHES_BASE_PATH}/${matchId}/vote/approve`,
    payload,
  )
  return mapMatchVoteStatusApiToMatchVoteStatus(response.data)
}

export const matchesApi = {
  createMatch,
  getGroupMatches,
  getMatchDetails,
  getMatchChallengeStatus,
  startLineDraw,
  submitLineDrawNumber,
  pickLinePlayer,
  startGoalkeeperDraw,
  submitGoalkeeperDrawNumber,
  pickGoalkeeper,
  confirmPresence,
  cancelPresence,
  markAbsent,
  cancelAbsent,
  addGuestToMatch,
  deleteMatch,
  getMatchVoteStatus,
  openMatchVoting,
  castMatchVote,
  closeMatchVote,
  approveMatchVote,
}
