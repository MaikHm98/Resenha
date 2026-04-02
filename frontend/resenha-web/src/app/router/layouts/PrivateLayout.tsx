import { Link, Outlet } from 'react-router-dom'
import { ROUTE_PATHS } from '../paths'

export function PrivateLayout() {
  return (
    <div className="app-shell">
      <main className="app-container">
        <header className="route-header">
          <span className="route-badge">Area privada (temporaria)</span>
          <nav className="route-nav" aria-label="Rotas privadas">
            <Link to={ROUTE_PATHS.HOME}>Home</Link>
            <Link to={ROUTE_PATHS.GROUPS}>Groups</Link>
            <Link to={ROUTE_PATHS.MATCHES}>Matches</Link>
            <Link to={ROUTE_PATHS.PROFILE}>Profile</Link>
          </nav>
        </header>
        <Outlet />
      </main>
    </div>
  )
}
