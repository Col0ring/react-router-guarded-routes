import React from 'react'
import { BrowserRouter, Link } from 'react-router-dom'
import {
  GuardConfigProvider,
  GuardMiddleware,
  GuardProvider,
  useGuardedRoutes,
} from 'react-router-guarded-routes'
import { routes } from './routes'
const logGuard: GuardMiddleware = (to, from, next) => {
  console.log('to: ', to)
  console.log('from: ', from)
  next()
}
const Routes: React.FC = () => {
  return <>{useGuardedRoutes(routes)}</>
}
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <GuardConfigProvider>
        <GuardProvider fallback={<div>loading...</div>} guards={[logGuard]}>
          <div
            style={{
              display: 'flex',
              width: 200,
              margin: '0 auto',
              justifyContent: 'space-between',
            }}
          >
            <Link to="/home">Home</Link>
            <Link to="/about">About</Link>
          </div>
          <Routes />
        </GuardProvider>
      </GuardConfigProvider>
    </BrowserRouter>
  )
}

export default App
