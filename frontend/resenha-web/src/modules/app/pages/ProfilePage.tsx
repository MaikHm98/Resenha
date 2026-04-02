import { ROUTE_PATHS } from '../../../app/router/paths'
import { PagePlaceholder } from '../../../shared/components/PagePlaceholder'

export function ProfilePage() {
  return (
    <PagePlaceholder
      title="Profile"
      description="Placeholder da pagina de perfil."
      route={ROUTE_PATHS.PROFILE}
    />
  )
}
