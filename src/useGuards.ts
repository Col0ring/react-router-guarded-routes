import { useRoutes } from 'react-router'
import { GuardObject } from './type'

type LocationArg = Parameters<typeof useRoutes>[1]

export function useGuards(guards: GuardObject[], locationArg?: LocationArg) {
  return useRoutes([], locationArg)
}
