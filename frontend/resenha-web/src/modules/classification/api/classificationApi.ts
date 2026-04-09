import { apiClient } from '../../../shared/lib/api'
import {
  mapClassificationRankingApiToClassificationRanking,
  mapMyClassificationStatsApiToMyClassificationStats,
} from '../mappers/classificationMapper'
import type {
  ClassificationRanking,
  ClassificationRankingApiResponse,
  MyClassificationStats,
  MyClassificationStatsApiResponse,
} from '../types/classificationContracts'

const GROUPS_BASE_PATH = '/api/groups'

async function getSeasonClassification(
  groupId: number,
): Promise<ClassificationRanking> {
  const response = await apiClient.get<ClassificationRankingApiResponse>(
    `${GROUPS_BASE_PATH}/${groupId}/classification`,
  )
  return mapClassificationRankingApiToClassificationRanking(response.data)
}

async function getAllTimeClassification(
  groupId: number,
): Promise<ClassificationRanking> {
  const response = await apiClient.get<ClassificationRankingApiResponse>(
    `${GROUPS_BASE_PATH}/${groupId}/classification/all-time`,
  )
  return mapClassificationRankingApiToClassificationRanking(response.data)
}

async function getMyClassificationStats(
  groupId: number,
): Promise<MyClassificationStats> {
  const response = await apiClient.get<MyClassificationStatsApiResponse>(
    `${GROUPS_BASE_PATH}/${groupId}/classification/me`,
  )
  return mapMyClassificationStatsApiToMyClassificationStats(response.data)
}

export const classificationApi = {
  getSeasonClassification,
  getAllTimeClassification,
  getMyClassificationStats,
}
