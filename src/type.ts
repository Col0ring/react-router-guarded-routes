import { Location, NavigateFunction, RouteObject } from 'react-router'

export interface GuardedRouteConfig {
  guards?: GuardMiddleware[]
  [props: PropertyKey]: any
}

export interface GuardedRouteObject extends RouteObject, GuardedRouteConfig {}

export interface NextFunction extends NavigateFunction {
  (): void
}

export type GuardMiddleware = (
  to: Location,
  from: Location | null,
  next: NextFunction
) => Promise<void> | void
