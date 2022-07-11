import React, { useEffect } from 'react'

const Route1: React.FC = () => {
  useEffect(() => {
    console.log('route1')
  }, [])
  return <div>route1</div>
}

export default Route1
