import { useId, type SelectHTMLAttributes } from 'react'
import { Label } from './Label'
import './ui.css'

export type SelectOption = {
  label: string
  value: string
}

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  hint?: string
  error?: string
  options: SelectOption[]
}

export function Select({
  id,
  label,
  hint,
  error,
  options,
  className,
  ...selectProps
}: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const hintId = hint ? `${selectId}-hint` : undefined
  const errorId = error ? `${selectId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  const classes = [
    'ui-input',
    'ui-select',
    error ? 'ui-input--invalid' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="ui-input-field">
      {label ? (
        <Label htmlFor={selectId} hint={hint}>
          {label}
        </Label>
      ) : null}

      <select
        aria-describedby={describedBy}
        aria-invalid={error ? 'true' : 'false'}
        className={classes}
        id={selectId}
        {...selectProps}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {hint && !label ? (
        <span className="ui-input-hint" id={hintId}>
          {hint}
        </span>
      ) : null}

      {error ? (
        <span className="ui-input-feedback ui-input-feedback--error" id={errorId}>
          {error}
        </span>
      ) : null}
    </div>
  )
}
