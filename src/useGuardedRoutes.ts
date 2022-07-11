import React, { useMemo } from 'react'
import { RouteObject, useRoutes } from 'react-router'
import { Guard } from './internal/guard'
import { GuardedRouteObject } from './type'

type LocationArg = Parameters<typeof useRoutes>[1]

function transformGuardedRoutes(
  guardedRoutes: GuardedRouteObject[]
): RouteObject[] {
  return guardedRoutes.map((guardedRoute) => {
    const { element, children } = guardedRoute
    return {
      ...guardedRoute,
      element:
        element !== undefined
          ? React.createElement(
              Guard,
              {
                route: guardedRoute,
              },
              element
            )
          : undefined,
      children:
        children !== undefined ? transformGuardedRoutes(children) : undefined,
    }
  })
}

export function useGuardedRoutes(
  guardedRoutes: GuardedRouteObject[],
  locationArg?: LocationArg
) {
  const routes = useMemo(
    () => transformGuardedRoutes(guardedRoutes),
    [guardedRoutes]
  )
  return useRoutes(routes, locationArg)
}
