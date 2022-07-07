import { Route } from 'react-router'
import { GuardConfig } from './type'
type RouteProps = Parameters<typeof Route>[0]

export type GuardProps = RouteProps & GuardConfig

export const Guard: React.FC<GuardProps> = () => {
  return null
}
