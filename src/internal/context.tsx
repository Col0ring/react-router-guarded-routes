import React, { createContext } from 'react'
import { GuardedRouteConfig } from '../type'
export interface GuardContextValue {
  loading?: React.ReactElement
  error?: React.ReactElement
  guards?: GuardedRouteConfig['guards']
}
export const GuardContext = createContext<GuardContextValue>({})
