import { Navigate } from 'react-router'
import { GuardedRouteObject } from 'react-router-guarded-routes'
import About from './About'
import Home from './Home'

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
    path: 'about',
    element: <About />,
    children: [
      {
        path: 'foo',
        element: <h1>foo</h1>,
        guards: [
          (to, from, next) => {
            console.log('matched about foo')
            next()
          },
        ],
        fallback: <div>loading about foo...</div>,
      },
      {
        path: 'bar',
        element: <h1>bar</h1>,
      },
    ],
  },
]
