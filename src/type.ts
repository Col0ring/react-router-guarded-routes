import { RouteObject, To } from 'react-router'

export interface GuardedRouteConfig {
  guards?: GuardMiddleware[]
  [props: PropertyKey]: any
}

export interface GuardedRouteObject extends RouteObject, GuardedRouteConfig {}

export type NextFunction = (to?: To) => Promise<void>

export type GuardMiddleware = (
  to: GuardedRouteObject,
  from: GuardedRouteObject,
  next: NextFunction
) => void
