import { Navigate } from 'react-router'
import { GuardedRouteObject } from 'react-router-guarded-routes'
import Home from './Home'
import Login from './Login'

export const routes: GuardedRouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/home" replace />,
  },
  {
    // for the nested routes
    path: 'home/*',
    element: <Home />,
  },
  {
    path: 'login',
    element: <Login />,
  },
]
