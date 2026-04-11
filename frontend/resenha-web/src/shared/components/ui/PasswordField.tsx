import { useState, type InputHTMLAttributes } from 'react'
import { Button } from './Button'
import { Input } from './Input'
import './ui.css'

export type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>
  & {
    label?: string
    hint?: string
    error?: string
  }

export function PasswordField(props: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="ui-password-field">
      <Input {...props} type={isVisible ? 'text' : 'password'} />
      <div className="ui-password-field__action">
        <Button
          onClick={() => setIsVisible((current) => !current)}
          size="sm"
          type="button"
          variant="secondary"
        >
          {isVisible ? 'Ocultar' : 'Mostrar'}
        </Button>
      </div>
    </div>
  )
}
