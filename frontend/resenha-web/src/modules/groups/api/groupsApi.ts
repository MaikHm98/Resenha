import { apiClient } from '../../../shared/lib/api'
import {
  mapAddGroupMemberResultApiToAddGroupMemberResult,
  mapGroupApiToGroup,
  mapGroupMemberApiToGroupMember,
  mapGroupPendingInviteApiToGroupPendingInvite,
  mapMessageApiToMessageResult,
} from '../mappers/groupsMapper'
import type {
  AddGroupMemberInput,
  AddGroupMemberResult,
  AddGroupMemberResultApiResponse,
  CreateGroupInput,
  Group,
  GroupApiResponse,
  GroupMember,
  GroupMemberApiResponse,
  GroupPendingInvite,
  GroupPendingInviteApiResponse,
  MessageApiResponse,
  MessageResult,
  UpdateGroupMemberRoleInput,
  UpdateGroupScheduleInput,
} from '../types/groupsContracts'

const GROUPS_BASE_PATH = '/api/groups'

async function getMyGroups(): Promise<Group[]> {
  const response = await apiClient.get<GroupApiResponse[]>(
    `${GROUPS_BASE_PATH}/me`,
  )
  return response.data.map(mapGroupApiToGroup)
}

async function createGroup(payload: CreateGroupInput): Promise<Group> {
  const response = await apiClient.post<GroupApiResponse>(
    GROUPS_BASE_PATH,
    payload,
  )
  return mapGroupApiToGroup(response.data)
}

async function getGroupMembers(groupId: number): Promise<GroupMember[]> {
  const response = await apiClient.get<GroupMemberApiResponse[]>(
    `${GROUPS_BASE_PATH}/${groupId}/members`,
  )
  return response.data.map(mapGroupMemberApiToGroupMember)
}

async function getGroupPendingInvites(
  groupId: number,
): Promise<GroupPendingInvite[]> {
  const response = await apiClient.get<GroupPendingInviteApiResponse[]>(
    `${GROUPS_BASE_PATH}/${groupId}/invites/pending`,
  )
  return response.data.map(mapGroupPendingInviteApiToGroupPendingInvite)
}

async function addMemberByEmail(
  groupId: number,
  payload: AddGroupMemberInput,
): Promise<AddGroupMemberResult> {
  const response = await apiClient.post<AddGroupMemberResultApiResponse>(
    `${GROUPS_BASE_PATH}/${groupId}/members`,
    payload,
  )
  return mapAddGroupMemberResultApiToAddGroupMemberResult(response.data)
}

async function updateMemberRole(
  groupId: number,
  memberUserId: number,
  payload: UpdateGroupMemberRoleInput,
): Promise<GroupMember> {
  const response = await apiClient.patch<GroupMemberApiResponse>(
    `${GROUPS_BASE_PATH}/${groupId}/members/${memberUserId}/role`,
    payload,
  )
  return mapGroupMemberApiToGroupMember(response.data)
}

async function removeMember(
  groupId: number,
  memberUserId: number,
): Promise<MessageResult> {
  const response = await apiClient.delete<MessageApiResponse>(
    `${GROUPS_BASE_PATH}/${groupId}/members/${memberUserId}`,
  )
  return mapMessageApiToMessageResult(response.data)
}

async function updateGroupSchedule(
  groupId: number,
  payload: UpdateGroupScheduleInput,
): Promise<MessageResult> {
  const response = await apiClient.patch<MessageApiResponse>(
    `${GROUPS_BASE_PATH}/${groupId}/schedule`,
    payload,
  )
  return mapMessageApiToMessageResult(response.data)
}

async function deleteGroup(groupId: number): Promise<MessageResult> {
  const response = await apiClient.delete<MessageApiResponse>(
    `${GROUPS_BASE_PATH}/${groupId}`,
  )
  return mapMessageApiToMessageResult(response.data)
}

export const groupsApi = {
  getMyGroups,
  createGroup,
  getGroupMembers,
  getGroupPendingInvites,
  addMemberByEmail,
  updateMemberRole,
  removeMember,
  updateGroupSchedule,
  deleteGroup,
}
