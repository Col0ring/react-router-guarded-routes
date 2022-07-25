import React from 'react'
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
  ctx: (value: T) => void
  end: () => void
}

export interface GuardedRouteMatch<ParamKey extends string = string>
  extends Omit<RouteMatch<ParamKey>, 'route'> {
  route: GuardedRouteObject
}

export interface ToGuardRouteOptions {
  location: Location
  matches: GuardedRouteMatch[]
  route: GuardedRouteObject
}

export interface FromGuardRouteOptions
  extends ReplacePick<
    ToGuardRouteOptions,
    ['location', 'route'],
    [
      ToGuardRouteOptions['location'] | null,
      ToGuardRouteOptions['route'] | null
    ]
  > {}

export interface ExternalOptions<T, I> {
  ctxValue: T
  injectedValue: I
}

export type GuardMiddlewareFunction<T = any, I = any> = (
  to: ToGuardRouteOptions,
  from: FromGuardRouteOptions,
  next: NextFunction<T>,
  externalOptions: ExternalOptions<T, I>
) => Promise<void> | void

export type GuardMiddlewareObject<T = any, I = any> = {
  handler: GuardMiddlewareFunction<T, I>
  register?: (
    to: ToGuardRouteOptions,
    from: FromGuardRouteOptions
  ) => Promise<boolean> | boolean
}
export type GuardMiddleware<T = any, I = any> =
  | GuardMiddlewareFunction<T, I>
  | GuardMiddlewareObject<T, I>
