import type { ReactNode } from 'react'
import './ui.css'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

export type AlertProps = {
  title?: string
  variant?: AlertVariant
  children: ReactNode
}

export function Alert({ title, variant = 'info', children }: AlertProps) {
  return (
    <div
      className={['ui-alert', `ui-alert--${variant}`].join(' ')}
      role="alert"
      aria-live="assertive"
    >
      {title ? <p className="ui-alert__title">{title}</p> : null}
      <div className="ui-alert__message">{children}</div>
    </div>
  )
}
