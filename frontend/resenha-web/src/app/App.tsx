import { AppRouter } from './router/AppRouter'
import { AuthProvider } from '../modules/auth/context/AuthProvider'

export function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
