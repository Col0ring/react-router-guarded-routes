import React from 'react'
import { BrowserRouter, Link, Outlet } from 'react-router-dom'
import {
  GuardedRoute,
  GuardedRoutes,
  GuardProvider,
} from 'react-router-guarded-routes'
import Route1 from './route1'

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
      <GuardProvider fallback={<div>loading...</div>}>
        <GuardedRoutes>
          <GuardedRoute
            guards={[
              (to, from, next) => {
                console.log(to, from)
                next()
              },
            ]}
            path="/"
            element={<div>111</div>}
          />
          <GuardedRoute
            path="/a/*"
            guards={[
              (to, from, next) => {
                console.log(to, from)
                // next()
              },
            ]}
            element={
              <div>
                22
                <GuardedRoutes>
                  <GuardedRoute
                    guards={[
                      (to, from, next) => {
                        console.log(to, from)
                        next()
                      },
                    ]}
                    path="c"
                    element={<div>ccc</div>}
                  />
                </GuardedRoutes>
                <Outlet />
              </div>
            }
          >
            <GuardedRoute
              guards={[
                (to, from, next) => {
                  console.log(to, from)
                  next()
                },
              ]}
              path="b"
              element={<Route1 />}
            />
          </GuardedRoute>
        </GuardedRoutes>
      </GuardProvider>
    </BrowserRouter>
  )
}

export default App
