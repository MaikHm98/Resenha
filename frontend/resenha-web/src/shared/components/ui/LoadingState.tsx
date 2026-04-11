import { Spinner } from './Spinner'
import './ui.css'

export type LoadingStateProps = {
  label?: string
}

export function LoadingState({ label = 'Carregando...' }: LoadingStateProps) {
  return (
    <section className="ui-state" aria-label={label}>
      <Spinner label={label} size="lg" />
    </section>
  )
}
