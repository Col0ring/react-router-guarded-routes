import React, { useMemo } from 'react'
import { Outlet, RoutesProps } from 'react-router'
import { GuardProvider } from './guard-provider'
import { GuardedRoute } from './guarded-route'
import { useInGuardConfigContext } from './internal/useInGuardContext'
import { invariant } from './internal/utils'
import { GuardedRouteObject } from './type'
import { useGuardedRoutes } from './useGuardedRoutes'

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

    if (element.type === GuardProvider) {
      routes.push({
        element: React.cloneElement(
          element,
          {
            ...element.props,
          },
          <Outlet />
        ),
        children: createGuardedRoutesFromChildren(element.props.children),
      })
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

    if (element.props.children) {
      route.children = createGuardedRoutesFromChildren(element.props.children)
    }

    routes.push(route)
  })

  return routes
}

export const GuardedRoutes: React.FC<GuardedRoutesProps> = (props) => {
  invariant(
    useInGuardConfigContext(),
    `You cannot render the <GuardedRoutes> outside a <GuardConfigProvider>.`
  )
  const { children, location: locationProp } = props

  const routes = useMemo(
    () => createGuardedRoutesFromChildren(children),
    [children]
  )
  return useGuardedRoutes(routes, locationProp)
}
