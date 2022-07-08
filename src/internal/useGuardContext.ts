import { useContext } from 'react'
import { GuardContext } from './context'

export function useGuardContext() {
  return useContext(GuardContext)
}
