import { ROUTE_PATHS } from '../../../app/router/paths'
import { PagePlaceholder } from '../../../shared/components/PagePlaceholder'

export function GroupsPage() {
  return (
    <PagePlaceholder
      title="Groups"
      description="Placeholder da pagina de grupos."
      route={ROUTE_PATHS.GROUPS}
    />
  )
}
