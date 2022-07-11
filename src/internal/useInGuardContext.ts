import { useRootContext } from './useRootContext'

export function useInGuardContext() {
  return useRootContext().location.to !== null
}
