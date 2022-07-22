import { useMemo, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import {
  GuardConfigProvider,
  GuardMiddleware,
  GuardProvider,
  useGuardedRoutes,
} from 'react-router-guarded-routes'
import { routes } from './routes'
import { AuthContext, AuthContextValue, useAuth } from './store'

const authGuard: GuardMiddleware<any, AuthContextValue> = (
  to,
  from,
  next,
  { injectValue }
) => {
  if (to.location.pathname !== '/login' && !injectValue.state.isLogin) {
    next('/login', {
      replace: true,
    })
    return
  }
  if (to.location.pathname === '/login' && injectValue.state.isLogin) {
    next('/home', {
      replace: true,
    })
    return
  }
  next()
}

const Routes: React.FC = () => {
  return <>{useGuardedRoutes(routes)}</>
}

const App: React.FC = () => {
  const [isLogin, setIsLogin] = useState(false)
  const context: AuthContextValue = useMemo(
    () => ({
      state: {
        isLogin,
      },
      methods: {
        login: () => {
          setIsLogin(true)
        },
        logout: () => {
          setIsLogin(false)
        },
      },
    }),
    [isLogin]
  )
  return (
    <BrowserRouter>
      <GuardConfigProvider>
        <GuardProvider
          fallback={<div>loading...</div>}
          inject={useAuth}
          guards={[authGuard]}
        >
          <AuthContext.Provider value={context}>
            <Routes />
          </AuthContext.Provider>
        </GuardProvider>
      </GuardConfigProvider>
    </BrowserRouter>
  )
}

export default App
