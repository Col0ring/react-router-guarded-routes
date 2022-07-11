import React, { createContext } from 'react'
import { Location } from 'react-router'
import { GuardedRouteConfig } from '../type'
export interface GuardContextValue {
  fallback?: React.ReactElement
  guards?: GuardedRouteConfig['guards']
}
export const GuardContext = createContext<GuardContextValue>({})

export interface GuardConfigContextValue {
  enableGuards: (
    location: Location,
    prevLocation: Location | null
  ) => Promise<boolean> | boolean
  location: {
    to: Location | null
    from: Location | null
  }
}

export const GuardConfigContext = createContext<GuardConfigContextValue>({
  location: {
    to: null,
    from: null,
  },
  enableGuards: (loc, prevLoc) => loc.pathname !== prevLoc?.pathname,
})
