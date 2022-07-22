import React from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from './store'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { methods } = useAuth()
  return (
    <div>
      <p>Login Page</p>
      <button onClick={() => methods.login()}>login</button>
      <button onClick={() => navigate('/home')}>to home</button>
    </div>
  )
}

export default Login
