import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { PrivateLayout } from './layouts/PrivateLayout'
import { PublicLayout } from './layouts/PublicLayout'
import { ROUTE_PATHS } from './paths'
import { GroupsPage } from '../../modules/app/pages/GroupsPage'
import { MatchesPage } from '../../modules/app/pages/MatchesPage'
import { ProfilePage } from '../../modules/app/pages/ProfilePage'
import { ForgotPasswordPage } from '../../modules/auth/pages/ForgotPasswordPage'
import { LoginPage } from '../../modules/auth/pages/LoginPage'
import { RegisterPage } from '../../modules/auth/pages/RegisterPage'
import { ResetPasswordPage } from '../../modules/auth/pages/ResetPasswordPage'
import { PrivateRoute } from '../../modules/auth/routes/PrivateRoute'
import { HomePage } from '../../modules/home/pages/HomePage'
import { PublicRoute } from '../../modules/auth/routes/PublicRoute'
import { NotFoundPage } from '../../modules/system/pages/NotFoundPage'

const appRouter = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          {
            path: ROUTE_PATHS.LOGIN,
            element: <LoginPage />,
          },
          {
            path: ROUTE_PATHS.REGISTER,
            element: <RegisterPage />,
          },
          {
            path: ROUTE_PATHS.FORGOT_PASSWORD,
            element: <ForgotPasswordPage />,
          },
          {
            path: ROUTE_PATHS.RESET_PASSWORD,
            element: <ResetPasswordPage />,
          },
        ],
      },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        path: ROUTE_PATHS.ROOT,
        element: <PrivateLayout />,
        children: [
          {
            index: true,
            element: <Navigate replace to={ROUTE_PATHS.HOME} />,
          },
          {
            path: 'home',
            element: <HomePage />,
          },
          {
            path: 'groups',
            element: <GroupsPage />,
          },
          {
            path: 'matches',
            element: <MatchesPage />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export function AppRouter() {
  return <RouterProvider router={appRouter} />
}
