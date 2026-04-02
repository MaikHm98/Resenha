import { ROUTE_PATHS } from '../../../app/router/paths'
import { PagePlaceholder } from '../../../shared/components/PagePlaceholder'

export function RootPage() {
  return (
    <PagePlaceholder
      title="Root"
      description="Placeholder da rota raiz privada."
      route={ROUTE_PATHS.ROOT}
    />
  )
}
