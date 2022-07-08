import React from 'react'
import { BrowserRouter, Outlet } from 'react-router-dom'
import {
  GuardedRoute,
  GuardedRoutes,
  GuardProvider,
} from 'react-router-guarded-routes'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <GuardProvider loading={<div>loading...</div>}>
        <GuardedRoutes>
          <GuardedRoute guards={[() => {}]} path="/" element={<div>111</div>} />
          <GuardedRoute
            path="/a/*"
            element={
              <div>
                22
                <GuardedRoutes>
                  <GuardedRoute path="c" element={<div>ccc</div>} />
                </GuardedRoutes>
                <Outlet />
              </div>
            }
          >
            <GuardedRoute
              guards={[() => {}]}
              path="b"
              element={<div>33</div>}
            />
          </GuardedRoute>
        </GuardedRoutes>
      </GuardProvider>
    </BrowserRouter>
  )
}

export default App
