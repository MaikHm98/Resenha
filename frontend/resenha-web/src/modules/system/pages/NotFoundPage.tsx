import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '../../../app/router/paths'
import { PagePlaceholder } from '../../../shared/components/PagePlaceholder'

export function NotFoundPage() {
  return (
    <div className="app-shell">
      <main className="app-container">
        <PagePlaceholder
          title="Not Found"
          description="A rota solicitada nao existe."
          route="*"
        />
        <div className="not-found-actions">
          <Link to={ROUTE_PATHS.ROOT}>Ir para /</Link>
          <Link to={ROUTE_PATHS.LOGIN}>Ir para /login</Link>
        </div>
      </main>
    </div>
  )
}
