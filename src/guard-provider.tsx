import React from 'react'
import { GuardContext, GuardContextValue } from './internal/context'

export interface GuardProviderProps extends GuardContextValue {
  children: React.ReactNode
}

export const GuardProvider: React.FC<GuardProviderProps> = (props) => {
  const { children, ...contextValue } = props
  return (
    <GuardContext.Provider value={contextValue}>
      {children}
    </GuardContext.Provider>
  )
}
