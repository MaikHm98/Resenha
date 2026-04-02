import type { ButtonHTMLAttributes } from 'react'
import { Spinner } from './Spinner'
import './ui.css'

type ButtonVariant = 'primary' | 'secondary' | 'danger'
type ButtonSize = 'sm' | 'md'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  children,
  className,
  disabled,
  ...buttonProps
}: ButtonProps) {
  const classes = [
    'ui-button',
    `ui-button--${variant}`,
    `ui-button--${size}`,
    fullWidth ? 'ui-button--full-width' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  const isDisabled = disabled || loading

  return (
    <button className={classes} disabled={isDisabled} {...buttonProps}>
      {loading ? <Spinner size="sm" label={null} /> : null}
      <span className={loading ? 'ui-button__label--loading' : undefined}>
        {children}
      </span>
    </button>
  )
}
