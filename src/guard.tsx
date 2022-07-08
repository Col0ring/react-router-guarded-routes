import React, { useMemo } from 'react'
import { GuardedRouteConfig } from './type'
import { useGuardContext } from './useGuardContext'

export interface GuardProps {
  guards?: GuardedRouteConfig['guards']
  children?: React.ReactNode
}

export const Guard: React.FC<GuardProps> = (props) => {
  const { children, guards: guardsProp } = props
  const { guards: globalGuards, error, loading } = useGuardContext()
  const guards = useMemo(
    () => [...(guardsProp || []), ...(globalGuards || [])],
    [globalGuards, guardsProp]
  )
  const hasGuard = useMemo(() => guards.length !== 0, [guards.length])
  if (hasGuard) {
    return <>{loading}</>
  }
  return <>{children}</>
}
