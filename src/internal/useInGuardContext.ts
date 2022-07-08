import { useGuardContext } from './useGuardContext'

export function useInGuardContext(): boolean {
  return useGuardContext().location.to !== null
}
