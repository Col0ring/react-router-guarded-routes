import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import { GuardProvider } from 'react-router-guarded-routes'

const About: React.FC = () => {
  return (
    <div>
      <h1>About</h1>
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
      </div>
      <GuardProvider
        fallback={<div>loading about...</div>}
        guards={[
          {
            handler: (to, from, next) => {
              setTimeout(() => {
                next(-1)
              }, 1000)
            },
            register: (to) => {
              if (to.location.pathname.includes('foo')) {
                return true
              }
              return false
            },
          },
        ]}
      >
        <Outlet />
      </GuardProvider>
    </div>
  )
}

export default About
