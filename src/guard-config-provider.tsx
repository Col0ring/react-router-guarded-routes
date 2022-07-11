import React, { useMemo } from 'react'
import { useLocation } from 'react-router'
import { GuardConfigContext, GuardConfigContextValue } from './internal/context'
import { useInGuardConfigContext } from './internal/useInGuardContext'
import { usePrevious } from './internal/usePrevious'
import { invariant } from './internal/utils'

export interface GuardConfigProviderProps
  extends Partial<Pick<GuardConfigContextValue, 'enableGuards'>> {
  children: React.ReactNode
}

export const GuardConfigProvider: React.FC<GuardConfigProviderProps> = (
  props
) => {
  invariant(
    !useInGuardConfigContext(),
    `You cannot render a <GuardConfigProvider> inside another <GuardConfigProvider>.` +
      ` You should never have more than one in your app.`
  )
  const { children, ...args } = props
  const location = useLocation()
  const prevLocation = usePrevious(location)

  const contextValue: GuardConfigContextValue = useMemo(
    () => ({
      enableGuards: (loc, prevLoc) => loc.pathname !== prevLoc?.pathname,
      enableFallback: () => true,
      ...args,
      location: {
        to: location,
        from: prevLocation || null,
      },
    }),
    [args, location, prevLocation]
  )

  return (
    <GuardConfigContext.Provider value={contextValue}>
      {children}
    </GuardConfigContext.Provider>
  )
}
