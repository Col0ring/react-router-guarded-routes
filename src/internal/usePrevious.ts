import { useRef } from 'react'

export function usePrevious<T>(state: T): T | undefined {
  const prevRef = useRef<T>()
  const curRef = useRef<T>()

  if (!Object.is(curRef.current, state)) {
    prevRef.current = curRef.current
    curRef.current = state
  }

  return prevRef.current
}
