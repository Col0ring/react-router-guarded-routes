import React, { useMemo } from 'react'
import { GuardContext, GuardContextValue } from './internal/context'
import { useGuardContext } from './internal/useGuardContext'

export interface GuardProviderProps extends GuardContextValue {
  children: React.ReactNode
}

export const GuardProvider: React.FC<GuardProviderProps> = (props) => {
  const { children, ...args } = props
  const { guards, inject } = useGuardContext()

  const guardContextValue: GuardContextValue = useMemo(
    () => ({
      ...args,
      inject: (to, from) => {
        return {
          ...inject?.(to, from),
          ...args.inject?.(to, from),
        }
      },
      guards: [...(guards || []), ...(args.guards || [])],
    }),
    [args, guards, inject]
  )

  return (
    <GuardContext.Provider value={guardContextValue}>
      {children}
    </GuardContext.Provider>
  )
}
