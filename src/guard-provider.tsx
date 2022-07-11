import React, { useMemo } from 'react'
import { useLocation } from 'react-router'
import { GuardContext, GuardContextValue } from './internal/context'
import { usePrevious } from './internal/usePrevious'

export interface GuardProviderProps extends GuardContextValue {
  children: React.ReactNode
}

export const GuardProvider: React.FC<GuardProviderProps> = (props) => {
  const { children, ...args } = props
  const location = useLocation()
  const prevLocation = usePrevious(location)

  const contextValue: GuardContextValue = useMemo(
    () => ({
      ...args,
      location: {
        to: location,
        from: prevLocation || null,
      },
    }),
    [args, location, prevLocation]
  )

  return (
    <GuardContext.Provider value={contextValue}>
      {children}
    </GuardContext.Provider>
  )
}
