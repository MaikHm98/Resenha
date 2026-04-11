import { useId, type InputHTMLAttributes } from 'react'
import './ui.css'

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
  description?: string
}

export function Checkbox({
  id,
  label,
  description,
  className,
  ...inputProps
}: CheckboxProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const descriptionId = description ? `${inputId}-description` : undefined

  const classes = ['ui-checkbox', className ?? ''].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <input
        aria-describedby={descriptionId}
        className="ui-checkbox__input"
        id={inputId}
        type="checkbox"
        {...inputProps}
      />
      <label className="ui-checkbox__label" htmlFor={inputId}>
        <span className="ui-checkbox__title">{label}</span>
        {description ? (
          <span className="ui-checkbox__description" id={descriptionId}>
            {description}
          </span>
        ) : null}
      </label>
    </div>
  )
}
