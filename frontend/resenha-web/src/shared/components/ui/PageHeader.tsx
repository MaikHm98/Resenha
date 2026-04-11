import type { ReactNode } from 'react'
import './ui.css'

export type PageHeaderProps = {
  title: string
  eyebrow?: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header className="ui-page-header">
      <div>
        {eyebrow ? <p className="ui-page-header__eyebrow">{eyebrow}</p> : null}
        <h1 className="ui-page-header__title">{title}</h1>
        {description ? (
          <p className="ui-page-header__description">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="ui-page-header__actions">{actions}</div> : null}
    </header>
  )
}
