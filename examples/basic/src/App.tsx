import React from 'react'
import { BrowserRouter, Link, Outlet } from 'react-router-dom'
import {
  GuardConfigProvider,
  GuardedRoute,
  GuardedRouteObject,
  GuardedRoutes,
  GuardProvider,
  useGuardedRoutes,
} from 'react-router-guarded-routes'
import Route1 from './route1'

const routes: GuardedRouteObject[] = [
  {
    path: '/',
    element: <div>111</div>,
    guards: [
      (to, from, next) => {
        next()
      },
    ],
  },
  {
    path: '/a/*',
    fallback: <div>loading inside...</div>,
    guards: [
      (to, from, next) => {
        console.log(to)
        next()
      },
    ],
    element: (
      <div>
        22
        <GuardedRoutes>
          <GuardedRoute
            guards={[
              (to, from, next) => {
                next()
              },
            ]}
            path=":c"
            element={<div>ccc</div>}
          />
        </GuardedRoutes>
        <Outlet />
      </div>
    ),
  },
  {
    path: '/b/*',
    element: <Route1 />,
    children: [
      {
        path: ':c',
        element: <Route1 />,
      },
    ],
  },
]

function Routes() {
  return <>{useGuardedRoutes(routes)}</>
}
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Link to="/" style={{ marginRight: 10 }}>
        /
      </Link>
      <Link to="/a/c" style={{ marginRight: 10 }}>
        /a/c
      </Link>
      <Link to="/a/b" style={{ marginRight: 10 }}>
        /a/b
      </Link>
      <Link to="/a/b" style={{ marginRight: 10 }}>
        /a/b
      </Link>
      <Link to="/b/c" style={{ marginRight: 10 }}>
        /b/c
      </Link>
      {/* <Routes>
        <Route path="/" element={<div>111</div>} />
        <Route path="/" element={<div>111</div>} />
        <Route
          path="/a/*"
          element={
            <div>
              22
              <Routes>
                <Route path="c" element={<div>ccc</div>} />
              </Routes>
              <Outlet />
            </div>
          }
        >
          <Route path="b" element={<Route1 />} />
        </Route>
      </Routes> */}
      <GuardConfigProvider>
        <GuardProvider fallback={<div>loading...</div>}>
          <Routes />
          {/* <GuardedRoutes>
            <GuardedRoute
              guards={[
                (to, from, next) => {
                  next()
                },
              ]}
              path="/"
              element={<div>111</div>}
            />
            <GuardedRoute
              path="/a/*"
              fallback={<div>loading inside...</div>}
              guards={[
                (to, from, next) => {
                  console.log(to)
                  next()
                },
              ]}
              element={
                <div>
                  22
                  <GuardedRoutes>
                    <GuardedRoute
                      guards={[
                        (to, from, next) => {
                          next()
                        },
                      ]}
                      path=":c"
                      element={<div>ccc</div>}
                    />
                  </GuardedRoutes>
                  <Outlet />
                </div>
              }
            />
            <GuardedRoute
              guards={[
                (to, from, next) => {
                  next()
                },
              ]}
              path="b/*"
              element={<Route1 />}
            >
              <GuardedRoute
                guards={[
                  (to, from, next) => {
                    next()
                  },
                ]}
                path=":c"
                element={<Route1 />}
              />
            </GuardedRoute>
          </GuardedRoutes> */}
        </GuardProvider>
      </GuardConfigProvider>
    </BrowserRouter>
  )
}

export default App
