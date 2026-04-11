import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthContext, type AuthContextValue } from '../modules/auth/context/AuthContext'
import { PrivateRoute } from '../modules/auth/routes/PrivateRoute'
import type { AuthSession } from '../modules/auth/types/AuthSession'

const sessaoValida: AuthSession = {
  accessToken: 'token-teste',
  userId: '1',
  userName: 'Jogador Teste',
  userEmail: 'jogador@teste.com',
  goleiro: false,
  timeCoracaoCodigo: null,
  timeCoracaoNome: null,
  timeCoracaoEscudoUrl: null,
  posicaoPrincipal: null,
  peDominante: null,
}

function criarAuthValue(session: AuthSession | null): AuthContextValue {
  return {
    session,
    isAuthenticated: Boolean(session),
    login: async () => sessaoValida,
    register: async () => sessaoValida,
    logout: () => {},
    forgotPassword: async () => ({ mensagem: 'ok' }),
    validateResetToken: async () => true,
    resetPassword: async () => ({ mensagem: 'ok' }),
    getClubOptions: async () => [],
    updateProfile: async () => sessaoValida,
    changePassword: async () => sessaoValida,
  }
}

function renderRotaPrivada(session: AuthSession | null) {
  render(
    <AuthContext.Provider value={criarAuthValue(session)}>
      <MemoryRouter initialEntries={['/home']}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route element={<p>Area autenticada</p>} path="/home" />
          </Route>
          <Route element={<p>Pagina de login</p>} path="/login" />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('protecao estrutural de rotas', () => {
  it('redireciona usuario sem sessao para login', () => {
    renderRotaPrivada(null)

    expect(screen.getByText('Pagina de login')).toBeInTheDocument()
  })

  it('libera usuario com sessao valida', () => {
    renderRotaPrivada(sessaoValida)

    expect(screen.getByText('Area autenticada')).toBeInTheDocument()
  })
})
