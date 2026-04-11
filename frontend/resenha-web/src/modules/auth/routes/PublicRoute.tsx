import { Navigate, Outlet } from 'react-router-dom'
import { ROUTE_PATHS } from '../../../app/router/paths'
import { useAuth } from '../hooks/useAuth'
import { isAuthSessionUsable } from '../types/AuthSession'

export function PublicRoute() {
  const { session } = useAuth()

  if (isAuthSessionUsable(session)) {
    return <Navigate replace to={ROUTE_PATHS.HOME} />
  }

  return <Outlet />
}
