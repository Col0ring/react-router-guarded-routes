import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Location, NavigateOptions, To, useNavigate } from 'react-router'
import { GuardedRouteObject, GuardMiddleware } from '../type'
import { useGuardConfigContext } from './useGuardConfigContext'
import { useGuardContext } from './useGuardContext'
import { isNumber, isPromise } from './utils'

export interface GuardProps {
  route: GuardedRouteObject
  children?: React.ReactNode
}

enum ResolvedStatus {
  NEXT = 'next',
  TO = 'to',
  GO = 'go',
}

type GuardedResult =
  | {
      type: ResolvedStatus.NEXT
    }
  | {
      type: ResolvedStatus.TO
      to: To
      options?: NavigateOptions
    }
  | {
      type: ResolvedStatus.GO
      delta: number
    }

export const Guard: React.FC<GuardProps> = (props) => {
  const { children, route } = props
  const { guards: guardsProp, fallback: fallbackProp } = route
  const [validated, setValidated] = useState(false)

  const { location, enableGuards, enableFallback } = useGuardConfigContext()
  const { guards: globalGuards, fallback } = useGuardContext()
  const navigate = useNavigate()
  const guards = useMemo(
    () => [...(guardsProp || []), ...(globalGuards || [])],
    [globalGuards, guardsProp]
  )
  const hasGuard = useMemo(() => guards.length !== 0, [guards.length])

  const canRunGuard = useMemo(
    () => enableGuards(location.to as Location, location.from),
    [enableGuards, location.from, location.to]
  )

  const canRunFallback = useMemo(
    () => enableFallback(location.to as Location, location.from),
    [enableFallback, location.from, location.to]
  )

  const runGuard = useCallback(
    (guard: GuardMiddleware) => {
      return new Promise<GuardedResult>((resolve, reject) => {
        try {
          const guardResult = guard(
            location.to as Location,
            location.from || null,
            (...args: [To, NavigateOptions?] | [number] | []) => {
              switch (args.length) {
                case 0:
                  resolve({
                    type: ResolvedStatus.NEXT,
                  })
                  break
                case 1:
                  if (isNumber(args[0])) {
                    resolve({
                      type: ResolvedStatus.GO,
                      delta: args[0],
                    })
                  } else {
                    resolve({
                      type: ResolvedStatus.TO,
                      to: args[0],
                    })
                  }
                  break
                case 2:
                  resolve({
                    type: ResolvedStatus.TO,
                    to: args[0],
                    options: args[1],
                  })
                  break
              }
            },
            { route }
          )
          if (isPromise(guardResult)) {
            guardResult.catch((error) => reject(error))
          }
        } catch (error) {
          reject(error)
        }
      })
    },
    [location.from, location.to, route]
  )

  const runGuards = useCallback(async () => {
    for (const guard of guards) {
      const result = await runGuard(guard)
      if (result.type === ResolvedStatus.NEXT) {
        continue
      } else if (result.type === ResolvedStatus.GO) {
        navigate(result.delta)
        return
      } else if (result.type === ResolvedStatus.TO) {
        navigate(result.to, result.options)
        return
      }
    }
    setValidated(true)
  }, [guards, navigate, runGuard])

  useEffect(() => {
    function validate() {
      setValidated(false)
      if (hasGuard) {
        runGuards()
      }
    }
    if (isPromise(canRunGuard)) {
      canRunGuard.then((done) => {
        if (done) {
          validate()
        }
      })
      return
    }
    if (canRunGuard) {
      validate()
    }
  }, [runGuards, hasGuard, enableGuards, canRunGuard])

  if (hasGuard && !validated && canRunFallback) {
    return <>{fallbackProp || fallback}</>
  }
  return <>{children}</>
}
