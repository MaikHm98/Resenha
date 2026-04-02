import { apiClient } from '../../../shared/lib/api'
import {
  mapHomeGroupApiToHomeGroup,
  mapPendingInviteApiToPendingInvite,
  mapRejectInviteApiToResult,
} from '../mappers/homeMapper'
import type {
  HomeGroup,
  HomeGroupApiResponse,
  HomePendingInvite,
  PendingInviteApiResponse,
  RejectInviteApiResponse,
  RejectInviteResult,
} from '../types/homeContracts'

const GROUPS_BASE_PATH = '/api/groups'

async function getMyGroups(): Promise<HomeGroup[]> {
  const response = await apiClient.get<HomeGroupApiResponse[]>(
    `${GROUPS_BASE_PATH}/me`,
  )
  return response.data.map(mapHomeGroupApiToHomeGroup)
}

async function getPendingInvites(): Promise<HomePendingInvite[]> {
  const response = await apiClient.get<PendingInviteApiResponse[]>(
    `${GROUPS_BASE_PATH}/invites/pending`,
  )
  return response.data.map(mapPendingInviteApiToPendingInvite)
}

async function acceptInvite(inviteId: number): Promise<HomeGroup> {
  const response = await apiClient.post<HomeGroupApiResponse>(
    `${GROUPS_BASE_PATH}/invites/${inviteId}/accept`,
  )
  return mapHomeGroupApiToHomeGroup(response.data)
}

async function rejectInvite(inviteId: number): Promise<RejectInviteResult> {
  const response = await apiClient.post<RejectInviteApiResponse>(
    `${GROUPS_BASE_PATH}/invites/${inviteId}/reject`,
  )
  return mapRejectInviteApiToResult(response.data)
}

export const homeApi = {
  getMyGroups,
  getPendingInvites,
  acceptInvite,
  rejectInvite,
}
