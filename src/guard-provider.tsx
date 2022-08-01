import React, { useMemo } from 'react'
import { GuardContext, GuardContextValue } from './internal/context'
import { useGuardContext } from './internal/useGuardContext'

export interface GuardProviderProps extends GuardContextValue {
  children: React.ReactNode
}

export const GuardProvider: React.FC<GuardProviderProps> = (props) => {
  const { children, ...args } = props
  const { guards, useInject } = useGuardContext()

  const guardContextValue: GuardContextValue = useMemo(
    () => ({
      ...args,
      useInject: (to, from) => {
        return {
          ...useInject?.(to, from),
          ...args.useInject?.(to, from),
        }
      },
      guards: [...(guards || []), ...(args.guards || [])],
    }),
    [args, guards, useInject]
  )

  return (
    <GuardContext.Provider value={guardContextValue}>
      {children}
    </GuardContext.Provider>
  )
}
