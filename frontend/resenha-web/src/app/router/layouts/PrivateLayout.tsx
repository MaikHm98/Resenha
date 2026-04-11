import { NavLink, Outlet } from 'react-router-dom'
import { ROUTE_PATHS } from '../paths'
import { Button } from '../../../shared/components'
import { useAuth } from '../../../modules/auth/hooks/useAuth'

const privateLinks = [
  { to: ROUTE_PATHS.HOME, label: 'Inicio', end: true },
  { to: ROUTE_PATHS.GROUPS, label: 'Grupos' },
  { to: ROUTE_PATHS.MATCHES, label: 'Partidas' },
  { to: ROUTE_PATHS.PROFILE, label: 'Perfil' },
]

export function PrivateLayout() {
  const { logout, session } = useAuth()

  return (
    <div className="app-shell">
      <main className="app-container">
        <header className="route-header route-header--private">
          <div className="route-header__top">
            <div className="route-header__badge-row">
              <span className="route-badge">Resenha App</span>
              <span className="route-badge route-badge--muted">Em campo</span>
            </div>

            <div className="route-header__actions">
              {session?.userName ? (
                <span className="route-header__user" title={session.userName}>
                  {session.userName}
                </span>
              ) : null}
              <Button
                onClick={logout}
                size="sm"
                type="button"
                variant="secondary"
              >
                Sair
              </Button>
            </div>
          </div>

          <div className="route-header__brand">
            <div className="route-header__brand-copy">
              <h1 className="route-header__title">Resenha em Campo</h1>
              <p className="route-header__subtitle">
                Grupos, partidas e perfil agora seguem a mesma atmosfera escura,
                vibrante e direta do app principal.
              </p>
            </div>

            <nav className="route-nav" aria-label="Rotas privadas">
              {privateLinks.map((link) => (
                <NavLink
                  className={({ isActive }) =>
                    [
                      'route-nav__link',
                      isActive ? 'route-nav__link--active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')
                  }
                  end={link.end}
                  key={link.to}
                  to={link.to}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  )
}
