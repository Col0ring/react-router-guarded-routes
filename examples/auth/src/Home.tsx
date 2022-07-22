import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  GuardedRoute,
  GuardedRoutes,
  GuardProvider,
} from 'react-router-guarded-routes'
import { useAuth } from './store'

const Home: React.FC = () => {
  const { methods } = useAuth()
  const navigate = useNavigate()
  return (
    <div>
      <h1>Home</h1>
      <button onClick={() => navigate('/login')}>to login</button>
      <button
        onClick={() => {
          methods.logout()
        }}
      >
        logout
      </button>
      <div
        style={{
          display: 'flex',
          width: 300,
          margin: '0 auto',
          justifyContent: 'space-between',
        }}
      >
        <Link to="./foo">Home-Foo</Link>
        <Link to="./bar">Home-Bar</Link>
        <Link to="./ban">Home-Ban</Link>
      </div>
      <GuardedRoutes>
        <GuardProvider
          fallback={<div>loading home...</div>}
          guards={[
            (to, from, next) => {
              if (to.location.pathname.includes('ban')) {
                setTimeout(() => {
                  next(-1)
                }, 2000)
              } else {
                next()
              }
            },
          ]}
        >
          <GuardedRoute path="foo" element={<h2>foo</h2>} />
          <GuardedRoute path="bar" element={<h2>bar</h2>} />
          <GuardedRoute
            path="ban"
            fallback={<div>loading ban...</div>}
            element={<h2>ban</h2>}
          />
        </GuardProvider>
      </GuardedRoutes>
    </div>
  )
}

export default Home
