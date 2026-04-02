import { ROUTE_PATHS } from '../../../app/router/paths'
import { PagePlaceholder } from '../../../shared/components/PagePlaceholder'

export function MatchesPage() {
  return (
    <PagePlaceholder
      title="Matches"
      description="Placeholder da pagina de partidas."
      route={ROUTE_PATHS.MATCHES}
    />
  )
}
