import type { LabelHTMLAttributes, ReactNode } from 'react'
import './ui.css'

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode
  hint?: string
}

export function Label({ children, className, hint, ...labelProps }: LabelProps) {
  const classes = ['ui-label', className ?? ''].filter(Boolean).join(' ')

  return (
    <label className={classes} {...labelProps}>
      <span>{children}</span>
      {hint ? <span className="ui-label__hint">{hint}</span> : null}
    </label>
  )
}
