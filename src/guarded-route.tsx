import React from 'react'
import { Route } from 'react-router'
import { GuardedRouteConfig } from './type'
import { invariant } from './utils'
type RouteProps = Parameters<typeof Route>[0]

export type GuardedRouteProps = RouteProps & GuardedRouteConfig

export const GuardedRoute: React.FC<GuardedRouteProps> = () => {
  invariant(
    false,
    `A <GuardedRoute> is only ever to be used as the child of <GuardedRoutes> element, ` +
      `never rendered directly. Please wrap your <GuardedRoute> in a <GuardedRoutes>.`
  )
}
