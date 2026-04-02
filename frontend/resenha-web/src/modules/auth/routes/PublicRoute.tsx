import { Navigate, Outlet } from 'react-router-dom'
import { ROUTE_PATHS } from '../../../app/router/paths'
import { useAuth } from '../hooks/useAuth'

export function PublicRoute() {
  const { session } = useAuth()

  if (session) {
    return <Navigate replace to={ROUTE_PATHS.HOME} />
  }

  return <Outlet />
}
