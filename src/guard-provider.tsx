import React, { useMemo } from 'react'
import { useLocation } from 'react-router'
import { GuardContext, GuardContextValue } from './internal/context'
import { useInGuardContext } from './internal/useInGuardContext'
import { usePrevious } from './internal/usePrevious'
import { invariant } from './utils'

export interface GuardProviderProps
  extends Omit<GuardContextValue, 'location'> {
  children: React.ReactNode
}

export const GuardProvider: React.FC<GuardProviderProps> = (props) => {
  invariant(
    !useInGuardContext(),
    `You cannot render a <GuardProvider> inside another <GuardProvider>.` +
      ` You should never have more than one in your app.`
  )

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
