import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  GuardedRoute,
  GuardedRoutes,
  GuardProvider,
} from 'react-router-guarded-routes'
// use hooks in inject function
function useInject() {
  return useState(0)
}
const Home: React.FC = () => {
  return (
    <div>
      <h1>Home</h1>
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
          inject={useInject}
          guards={[
            (to, from, next, { injectedValue }) => {
              console.log(injectedValue)
              if (to.location.pathname.includes('ban')) {
                setTimeout(() => {
                  next(-1)
                }, 2000)
              } else {
                setTimeout(() => {
                  next()
                }, 500)
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
