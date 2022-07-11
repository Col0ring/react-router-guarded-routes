import React, { createContext } from 'react'
import { Location } from 'react-router'
import { GuardedRouteConfig } from '../type'
export interface GuardContextValue {
  fallback?: React.ReactElement
  guards?: GuardedRouteConfig['guards']
}
export const GuardContext = createContext<GuardContextValue>({})

export interface RootContextValue {
  location: {
    to: Location | null
    from: Location | null
  }
}

export const RootContext = createContext<RootContextValue>({
  location: {
    to: null,
    from: null,
  },
})
