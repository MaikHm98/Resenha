import { NavLink, Outlet } from 'react-router-dom'
import { ROUTE_PATHS } from '../paths'

const publicLinks = [
  { to: ROUTE_PATHS.LOGIN, label: 'Entrar' },
  { to: ROUTE_PATHS.REGISTER, label: 'Criar conta' },
  { to: ROUTE_PATHS.FORGOT_PASSWORD, label: 'Recuperar senha' },
  { to: ROUTE_PATHS.RESET_PASSWORD, label: 'Redefinir senha' },
]

export function PublicLayout() {
  return (
    <div className="app-shell">
      <main className="app-container">
        <header className="route-header route-header--public">
          <div className="route-header__brand">
            <div className="route-header__brand-copy">
              <div className="route-header__badge-row">
                <span className="route-badge">Resenha App</span>
                <span className="route-badge route-badge--muted">Acesso web</span>
              </div>

              <h1 className="route-header__title">Entre na resenha</h1>
              <p className="route-header__subtitle">
                Organize o rachao no navegador com a mesma linguagem de campo
                do app e sem perder o clima da arquibancada.
              </p>
            </div>

            <nav className="route-nav" aria-label="Rotas publicas">
              {publicLinks.map((link) => (
                <NavLink
                  className={({ isActive }) =>
                    [
                      'route-nav__link',
                      isActive ? 'route-nav__link--active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')
                  }
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
