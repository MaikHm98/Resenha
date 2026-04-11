import type { ReactNode } from 'react'
import { Button } from './Button'
import './ui.css'

export type DialogProps = {
  title: string
  description?: string
  open: boolean
  children: ReactNode
  onClose: () => void
}

export function Dialog({
  title,
  description,
  open,
  children,
  onClose,
}: DialogProps) {
  if (!open) {
    return null
  }

  return (
    <div className="ui-dialog" role="presentation">
      <div
        aria-modal="true"
        aria-labelledby="ui-dialog-title"
        className="ui-dialog__panel"
        role="dialog"
      >
        <header className="ui-dialog__header">
          <div>
            <h2 className="ui-dialog__title" id="ui-dialog-title">
              {title}
            </h2>
            {description ? (
              <p className="ui-dialog__description">{description}</p>
            ) : null}
          </div>
          <Button onClick={onClose} size="sm" type="button" variant="secondary">
            Fechar
          </Button>
        </header>

        <div className="ui-dialog__content">{children}</div>
      </div>
    </div>
  )
}
