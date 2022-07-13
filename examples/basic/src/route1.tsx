import React, { useEffect } from 'react'
import { Outlet } from 'react-router'

const Route1: React.FC = () => {
  useEffect(() => {
    console.log('route1')
  }, [])
  return (
    <div>
      route1
      <Outlet />
    </div>
  )
}

export default Route1
