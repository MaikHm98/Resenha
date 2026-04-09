import { apiClient } from '../../../shared/lib/api'
import {
  mapCaptainPlayerSummaryApiToCaptainPlayerSummary,
  mapCaptainStatusApiToCaptainStatus,
} from '../mappers/captainMapper'
import type {
  CaptainPlayerSummary,
  CaptainPlayerSummaryApiResponse,
  CaptainStatus,
  CaptainStatusApiResponse,
  LaunchCaptainChallengeInput,
  RegisterCaptainChallengeResultInput,
} from '../types/captainContracts'

const GROUPS_BASE_PATH = '/api/groups'

async function getCaptainStatus(groupId: number): Promise<CaptainStatus> {
  const response = await apiClient.get<CaptainStatusApiResponse>(
    `${GROUPS_BASE_PATH}/${groupId}/captain`,
  )
  return mapCaptainStatusApiToCaptainStatus(response.data)
}

async function drawCaptain(groupId: number): Promise<CaptainStatus> {
  const response = await apiClient.post<CaptainStatusApiResponse>(
    `${GROUPS_BASE_PATH}/${groupId}/captain/draw`,
  )
  return mapCaptainStatusApiToCaptainStatus(response.data)
}

async function getEligibleChallengers(
  groupId: number,
  matchId: number,
): Promise<CaptainPlayerSummary[]> {
  const response = await apiClient.get<CaptainPlayerSummaryApiResponse[]>(
    `${GROUPS_BASE_PATH}/${groupId}/captain/eligible/${matchId}`,
  )
  return response.data.map(mapCaptainPlayerSummaryApiToCaptainPlayerSummary)
}

async function launchChallenge(
  groupId: number,
  payload: LaunchCaptainChallengeInput,
): Promise<CaptainStatus> {
  const response = await apiClient.post<CaptainStatusApiResponse>(
    `${GROUPS_BASE_PATH}/${groupId}/captain/challenge`,
    payload,
  )
  return mapCaptainStatusApiToCaptainStatus(response.data)
}

async function registerChallengeResult(
  groupId: number,
  payload: RegisterCaptainChallengeResultInput,
): Promise<CaptainStatus> {
  const response = await apiClient.post<CaptainStatusApiResponse>(
    `${GROUPS_BASE_PATH}/${groupId}/captain/result`,
    payload,
  )
  return mapCaptainStatusApiToCaptainStatus(response.data)
}

export const captainApi = {
  getCaptainStatus,
  drawCaptain,
  getEligibleChallengers,
  launchChallenge,
  registerChallengeResult,
}
