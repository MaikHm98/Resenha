import { useId, type InputHTMLAttributes } from 'react'
import './ui.css'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
  error?: string
}

export function Input({
  id,
  label,
  hint,
  error,
  className,
  ...inputProps
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  const classes = [
    'ui-input',
    error ? 'ui-input--invalid' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="ui-input-field">
      {label || hint ? (
        <div className="ui-input-field__header">
          {label ? (
            <label className="ui-input-label" htmlFor={inputId}>
              {label}
            </label>
          ) : (
            <span />
          )}
          {hint ? (
            <span className="ui-input-hint" id={hintId}>
              {hint}
            </span>
          ) : null}
        </div>
      ) : null}

      <input
        aria-describedby={describedBy}
        aria-invalid={error ? 'true' : 'false'}
        className={classes}
        id={inputId}
        {...inputProps}
      />

      {error ? (
        <span className="ui-input-feedback ui-input-feedback--error" id={errorId}>
          {error}
        </span>
      ) : null}
    </div>
  )
}
