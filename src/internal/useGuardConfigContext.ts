import { useContext } from 'react'
import { GuardConfigContext } from './context'

export function useGuardConfigContext() {
  return useContext(GuardConfigContext)
}
