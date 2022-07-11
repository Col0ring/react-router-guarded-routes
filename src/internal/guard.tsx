import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Location, NavigateOptions, To, useNavigate } from 'react-router'
import { GuardedRouteConfig, GuardMiddleware } from '../type'
import { useGuardConfigContext } from './useGuardConfigContext'
import { useGuardContext } from './useGuardContext'
import { isNumber, isPromise } from './utils'

export interface GuardProps {
  guards?: GuardedRouteConfig['guards']
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
  const { children, guards: guardsProp } = props
  const [validated, setValidated] = useState(false)

  const { location, enableGuards } = useGuardConfigContext()
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
            }
          )
          if (isPromise(guardResult)) {
            guardResult.catch((error) => reject(error))
          }
        } catch (error) {
          reject(error)
        }
      })
    },
    [location]
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
    if (canRunGuard) {
      setValidated(false)
      if (hasGuard) {
        runGuards()
      }
    }
  }, [runGuards, location, hasGuard, enableGuards, canRunGuard])

  if (hasGuard && canRunGuard && !validated) {
    return <>{fallback}</>
  }
  return <>{children}</>
}
