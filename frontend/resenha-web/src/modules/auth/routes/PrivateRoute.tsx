import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTE_PATHS } from '../../../app/router/paths'
import { useAuth } from '../hooks/useAuth'
import { isAuthSessionUsable } from '../types/AuthSession'

export function PrivateRoute() {
  const location = useLocation()
  const { session } = useAuth()

  if (!isAuthSessionUsable(session)) {
    return <Navigate replace state={{ from: location }} to={ROUTE_PATHS.LOGIN} />
  }

  return <Outlet />
}
