import React, { useMemo } from 'react'
import { useLocation } from 'react-router'
import { RootContext, RootContextValue } from './internal/context'
import { useInGuardContext } from './internal/useInGuardContext'
import { usePrevious } from './internal/usePrevious'
import { invariant } from './internal/utils'

export interface RootProviderProps extends Omit<RootContextValue, 'location'> {
  children: React.ReactNode
}

export const RootProvider: React.FC<RootProviderProps> = (props) => {
  invariant(
    !useInGuardContext(),
    `You cannot render a <GuardProvider> inside another <GuardProvider>.` +
      ` You should never have more than one in your app.`
  )
  const { children, ...args } = props
  const location = useLocation()
  const prevLocation = usePrevious(location)

  const contextValue: RootContextValue = useMemo(
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
    <RootContext.Provider value={contextValue}>{children}</RootContext.Provider>
  )
}
