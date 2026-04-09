import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { PrivateLayout } from './layouts/PrivateLayout'
import { PublicLayout } from './layouts/PublicLayout'
import { ROUTE_PATHS } from './paths'
import { ProfilePage } from '../../modules/app/pages/ProfilePage'
import { ForgotPasswordPage } from '../../modules/auth/pages/ForgotPasswordPage'
import { LoginPage } from '../../modules/auth/pages/LoginPage'
import { RegisterPage } from '../../modules/auth/pages/RegisterPage'
import { ResetPasswordPage } from '../../modules/auth/pages/ResetPasswordPage'
import { PrivateRoute } from '../../modules/auth/routes/PrivateRoute'
import { CaptainPage } from '../../modules/captain/pages/CaptainPage'
import { ClassificationPage } from '../../modules/classification/pages/ClassificationPage'
import { GroupDetailPage } from '../../modules/groups/pages/GroupDetailPage'
import { GroupsPage } from '../../modules/groups/pages/GroupsPage'
import { HomePage } from '../../modules/home/pages/HomePage'
import { GroupMatchesPage } from '../../modules/matches/pages/GroupMatchesPage'
import { MatchChallengePage } from '../../modules/matches/pages/MatchChallengePage'
import { MatchDetailPage } from '../../modules/matches/pages/MatchDetailPage'
import { MatchesPage } from '../../modules/matches/pages/MatchesPage'
import { MatchVotePage } from '../../modules/matches/pages/MatchVotePage'
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
            children: [
              {
                index: true,
                element: <GroupsPage />,
              },
              {
                path: ':groupId',
                element: <GroupDetailPage />,
              },
              {
                path: ':groupId/captain',
                element: <CaptainPage />,
              },
              {
                path: ':groupId/classification',
                element: <ClassificationPage />,
              },
              {
                path: ':groupId/matches',
                element: <GroupMatchesPage />,
              },
            ],
          },
          {
            path: 'matches',
            children: [
              {
                index: true,
                element: <MatchesPage />,
              },
              {
                path: ':matchId/challenge',
                element: <MatchChallengePage />,
              },
              {
                path: ':matchId/vote',
                element: <MatchVotePage />,
              },
              {
                path: ':matchId',
                element: <MatchDetailPage />,
              },
            ],
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
