export const ROUTE_PATHS = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ROOT: '/',
  HOME: '/home',
  GROUPS: '/groups',
  GROUP_DETAIL: '/groups/:groupId',
  GROUP_CAPTAIN: '/groups/:groupId/captain',
  GROUP_CLASSIFICATION: '/groups/:groupId/classification',
  GROUP_MATCHES: '/groups/:groupId/matches',
  GROUP_MATCH_HISTORY: '/groups/:groupId/matches/history',
  MATCHES: '/matches',
  MATCH_DETAIL: '/matches/:matchId',
  MATCH_CHALLENGE: '/matches/:matchId/challenge',
  MATCH_HISTORY: '/matches/:matchId/history',
  MATCH_VOTE: '/matches/:matchId/vote',
  PROFILE: '/profile',
  PROFILE_CHANGE_PASSWORD: '/profile/change-password',
} as const

export function buildGroupDetailPath(groupId: number | string) {
  return ROUTE_PATHS.GROUP_DETAIL.replace(
    ':groupId',
    encodeURIComponent(String(groupId)),
  )
}

export function buildGroupCaptainPath(groupId: number | string) {
  return ROUTE_PATHS.GROUP_CAPTAIN.replace(
    ':groupId',
    encodeURIComponent(String(groupId)),
  )
}

export function buildGroupClassificationPath(groupId: number | string) {
  return ROUTE_PATHS.GROUP_CLASSIFICATION.replace(
    ':groupId',
    encodeURIComponent(String(groupId)),
  )
}

export function buildGroupMatchesPath(groupId: number | string) {
  return ROUTE_PATHS.GROUP_MATCHES.replace(
    ':groupId',
    encodeURIComponent(String(groupId)),
  )
}

export function buildGroupMatchHistoryPath(groupId: number | string) {
  return ROUTE_PATHS.GROUP_MATCH_HISTORY.replace(
    ':groupId',
    encodeURIComponent(String(groupId)),
  )
}

export function buildMatchDetailPath(matchId: number | string) {
  return ROUTE_PATHS.MATCH_DETAIL.replace(
    ':matchId',
    encodeURIComponent(String(matchId)),
  )
}

export function buildMatchHistoryPath(matchId: number | string) {
  return ROUTE_PATHS.MATCH_HISTORY.replace(
    ':matchId',
    encodeURIComponent(String(matchId)),
  )
}

export function buildMatchChallengePath(matchId: number | string) {
  return ROUTE_PATHS.MATCH_CHALLENGE.replace(
    ':matchId',
    encodeURIComponent(String(matchId)),
  )
}

export function buildMatchVotePath(matchId: number | string) {
  return ROUTE_PATHS.MATCH_VOTE.replace(
    ':matchId',
    encodeURIComponent(String(matchId)),
  )
}
