import type { ReactNode } from 'react'
import { Alert } from './Alert'
import './ui.css'

export type ErrorStateProps = {
  title?: string
  message: string
  action?: ReactNode
}

export function ErrorState({
  title = 'Nao foi possivel continuar',
  message,
  action,
}: ErrorStateProps) {
  return (
    <section className="ui-state" aria-label={title}>
      <Alert title={title} variant="error">
        {message}
      </Alert>
      {action ? <div className="ui-state__action">{action}</div> : null}
    </section>
  )
}
