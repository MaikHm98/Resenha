import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Button,
  Checkbox,
  ErrorState,
  Input,
  PasswordField,
  Select,
} from '../shared/components'

describe('componentes base de UI', () => {
  it('renderiza campos e acoes reutilizaveis', () => {
    render(
      <form>
        <Input label="Email" placeholder="voce@email.com" />
        <PasswordField label="Senha" />
        <Select
          label="Pe dominante"
          options={[
            { label: 'Direito', value: 'DIREITO' },
            { label: 'Esquerdo', value: 'ESQUERDO' },
          ]}
        />
        <Checkbox label="Sou goleiro" />
        <Button type="submit">Entrar</Button>
      </form>,
    )

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
    expect(screen.getByLabelText('Pe dominante')).toHaveValue('DIREITO')
    expect(screen.getByLabelText('Sou goleiro')).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled()
  })

  it('renderiza estado de erro padrao', () => {
    render(<ErrorState message="Falha ao carregar dados." />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Falha ao carregar dados.',
    )
  })
})
