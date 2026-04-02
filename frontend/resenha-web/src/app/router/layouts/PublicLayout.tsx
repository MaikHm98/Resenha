import { Link, Outlet } from 'react-router-dom'
import { ROUTE_PATHS } from '../paths'

export function PublicLayout() {
  return (
    <div className="app-shell">
      <main className="app-container">
        <header className="route-header">
          <span className="route-badge">Area publica</span>
          <nav className="route-nav" aria-label="Rotas publicas">
            <Link to={ROUTE_PATHS.LOGIN}>Login</Link>
            <Link to={ROUTE_PATHS.REGISTER}>Register</Link>
            <Link to={ROUTE_PATHS.FORGOT_PASSWORD}>Forgot Password</Link>
            <Link to={ROUTE_PATHS.RESET_PASSWORD}>Reset Password</Link>
          </nav>
        </header>
        <Outlet />
      </main>
    </div>
  )
}
