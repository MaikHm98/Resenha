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
  MATCHES: '/matches',
  MATCH_DETAIL: '/matches/:matchId',
  MATCH_CHALLENGE: '/matches/:matchId/challenge',
  MATCH_VOTE: '/matches/:matchId/vote',
  PROFILE: '/profile',
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

export function buildMatchDetailPath(matchId: number | string) {
  return ROUTE_PATHS.MATCH_DETAIL.replace(
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
