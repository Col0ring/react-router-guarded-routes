import React, { createContext } from 'react'
import { Location } from 'react-router'
import {
  FromGuardRouteOptions,
  GuardedRouteConfig,
  ToGuardRouteOptions,
} from '../type'
export interface GuardContextValue {
  fallback?: React.ReactElement
  guards?: GuardedRouteConfig['guards']
}
export const GuardContext = createContext<GuardContextValue>({})

export interface GuardConfigContextValue {
  enableGuards: (
    to: ToGuardRouteOptions,
    from: FromGuardRouteOptions
  ) => Promise<boolean> | boolean
  enableFallback: (
    to: ToGuardRouteOptions,
    from: FromGuardRouteOptions
  ) => boolean
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
  enableGuards: (to, from) => to.location.pathname !== from.location?.pathname,
  enableFallback: () => true,
})
