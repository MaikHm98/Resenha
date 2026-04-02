import './ui.css'

type SpinnerSize = 'sm' | 'md' | 'lg'

export type SpinnerProps = {
  size?: SpinnerSize
  label?: string | null
}

export function Spinner({ size = 'md', label = 'Carregando...' }: SpinnerProps) {
  const spinnerElement = (
    <span
      aria-hidden="true"
      className={['ui-spinner', `ui-spinner--${size}`].join(' ')}
    />
  )

  if (!label) {
    return spinnerElement
  }

  return (
    <span aria-live="polite" className="ui-spinner__wrapper" role="status">
      {spinnerElement}
      <span className="ui-spinner__label">{label}</span>
    </span>
  )
}
