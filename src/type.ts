import { RouteObject } from 'react-router'

export interface GuardConfig {
  guards?: GuardMiddleware[]
  [props: PropertyKey]: any
}

export interface GuardObject extends RouteObject, GuardConfig {}

export type GuardMiddleware = (to: GuardObject, from: GuardObject, next) => void
