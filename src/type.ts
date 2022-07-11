import { Location, NavigateFunction, RouteObject } from 'react-router'

export interface GuardedRouteConfig {
  guards?: GuardMiddleware[]
  fallback?: React.ReactNode
  [props: PropertyKey]: any
}

export interface GuardedRouteObject extends RouteObject, GuardedRouteConfig {}

export interface NextFunction extends NavigateFunction {
  (): void
}
export interface GuardMiddlewareOptions {
  route: GuardedRouteObject
}

export type GuardMiddleware = (
  to: Location,
  from: Location | null,
  next: NextFunction,
  options: GuardMiddlewareOptions
) => Promise<void> | void
