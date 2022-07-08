import React from 'react'
import { RoutesProps } from 'react-router'
import { GuardedRoute } from './guarded-route'
import { GuardedRouteObject } from './type'
import { useGuardedRoutes } from './useGuardedRoutes'
import { invariant } from './utils'

export interface GuardedRoutesProps extends RoutesProps {}

function createGuardedRoutesFromChildren(children: React.ReactNode) {
  const routes: GuardedRouteObject[] = []

  React.Children.forEach(children, (element) => {
    if (!React.isValidElement(element)) {
      // Ignore non-elements. This allows people to more easily inline
      // conditionals in their route config.
      return
    }

    if (element.type === React.Fragment) {
      // Transparently support React.Fragment and its children.
      routes.push(...createGuardedRoutesFromChildren(element.props.children))
      return
    }

    invariant(
      element.type === GuardedRoute,
      `[${
        typeof element.type === 'string' ? element.type : element.type.name
      }] is not a <GuardedRoute> component. All component children of <GuardedRoutes> must be a <GuardedRoute> or <React.Fragment>`
    )

    const route = {
      ...element.props,
    }

    // 递归
    if (element.props.children) {
      route.children = createGuardedRoutesFromChildren(element.props.children)
    }

    routes.push(route)
  })

  return routes
}

export const GuardedRoutes: React.FC<GuardedRoutesProps> = (props) => {
  const { children, location } = props
  return useGuardedRoutes(createGuardedRoutesFromChildren(children), location)
}
