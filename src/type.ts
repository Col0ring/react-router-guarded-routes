import {
  Location,
  NavigateFunction,
  RouteMatch,
  RouteObject,
} from 'react-router'
import { ReplacePick } from 'types-kit'

export interface GuardedRouteConfig {
  guards?: GuardMiddleware[]
  fallback?: React.ReactNode
  [props: PropertyKey]: any
}

export interface GuardedRouteObject extends RouteObject, GuardedRouteConfig {
  children?: GuardedRouteObject[]
}

export interface NextFunction<T> extends NavigateFunction {
  (): void
  value: T
  ctx: (value: T) => void
}

export interface GuardedRouteMatch<ParamKey extends string = string>
  extends Omit<RouteMatch<ParamKey>, 'route'> {
  route: GuardedRouteObject
}

export interface ToGuardRouteOptions {
  location: Location
  matches: GuardedRouteMatch[]
}

export interface FromGuardRouteOptions
  extends ReplacePick<
    ToGuardRouteOptions,
    ['location'],
    [ToGuardRouteOptions['location'] | null]
  > {}

export type GuardMiddleware<T = any> = (
  to: ToGuardRouteOptions,
  from: FromGuardRouteOptions,
  next: NextFunction<T>
) => Promise<void> | void
