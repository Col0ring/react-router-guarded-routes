import { Navigate, Outlet } from 'react-router'
import { GuardedRouteObject, GuardProvider } from 'react-router-guarded-routes'
import About from './About'
import Home from './Home'

export const routes: GuardedRouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/home" replace />,
  },
  {
    element: (
      <GuardProvider
        guards={[
          (to, from, next) => {
            next.ctx('ctx value')
          },
        ]}
      >
        <Outlet />
      </GuardProvider>
    ),
    children: [
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
            guards: [
              (to, from, next, { ctxValue }) => {
                console.log('matched about bar')
                console.log('ctxValue:', ctxValue)
                next()
              },
            ],
            path: 'bar',
            element: <h1>bar</h1>,
          },
        ],
      },
    ],
  },
]
