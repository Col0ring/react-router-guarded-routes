import { useContext } from 'react'
import { RootContext } from './context'

export function useRootContext() {
  return useContext(RootContext)
}
