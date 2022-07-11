import { useGuardConfigContext } from './useGuardConfigContext'

export function useInGuardConfigContext() {
  return useGuardConfigContext().location.to !== null
}
