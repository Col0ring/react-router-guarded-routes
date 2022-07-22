import { createContext, useContext } from 'react'

function noop() {}

export interface AuthContextState {
  isLogin: boolean
}
export interface AuthContextMethods {
  login: () => void
  logout: () => void
}
export interface AuthContextValue {
  state: AuthContextState
  methods: AuthContextMethods
}

export function createInitialAuthValue(): AuthContextState {
  return {
    isLogin: false,
  }
}

export const AuthContext = createContext<AuthContextValue>({
  state: createInitialAuthValue(),
  methods: {
    login: noop,
    logout: noop,
  },
})

export function useAuth() {
  return useContext(AuthContext)
}
