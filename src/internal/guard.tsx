import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Location,
  NavigateOptions,
  To,
  UNSAFE_RouteContext as RouteContext,
  useNavigate,
} from 'react-router'
import {
  FromGuardRouteOptions,
  GuardedRouteObject,
  GuardMiddlewareFunction,
  NextFunction,
  ToGuardRouteOptions,
} from '../type'
import { useGuardConfigContext } from './useGuardConfigContext'
import { useGuardContext } from './useGuardContext'
import { usePrevious } from './usePrevious'
import { isFunction, isNumber, isPromise, isUndefined } from './utils'

export interface GuardProps {
  route: GuardedRouteObject
  children?: React.ReactNode
}

enum ResolvedStatus {
  NEXT = 'next',
  TO = 'to',
  GO = 'go',
}

type GuardedResult<T> = {
  value: T
} & (
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
)

export const Guard: React.FC<GuardProps> = (props) => {
  const { children, route } = props
  const { guards: guardsProp, fallback: fallbackProp } = route
  const [validated, setValidated] = useState(false)
  const validatingRef = useRef(false)
  const { location, enableGuards, enableFallback } = useGuardConfigContext()
  const { guards: wrapperGuards, fallback } = useGuardContext()
  const navigate = useNavigate()
  const guards = useMemo(
    () => [...(wrapperGuards || []), ...(guardsProp || [])],
    [wrapperGuards, guardsProp]
  )
  const hasGuard = useMemo(() => guards.length !== 0, [guards.length])

  const { matches } = useContext(RouteContext)
  const prevMatches = usePrevious(matches)
  const toGuardRouteOptions: ToGuardRouteOptions = useMemo(
    () => ({
      location: location.to as Location,
      matches,
      route: matches[matches.length - 1]?.route,
    }),
    [location.to, matches]
  )
  const fromGuardRouteOptions: FromGuardRouteOptions = useMemo(
    () => ({
      location: location.from,
      matches: prevMatches || [],
      route: prevMatches ? prevMatches[prevMatches.length - 1]?.route : null,
    }),
    [location.from, prevMatches]
  )
  const canRunGuard = useMemo(
    () => enableGuards(toGuardRouteOptions, fromGuardRouteOptions),
    [enableGuards, fromGuardRouteOptions, toGuardRouteOptions]
  )

  const canRunFallback = useMemo(
    () => enableFallback(toGuardRouteOptions, fromGuardRouteOptions),
    [enableFallback, fromGuardRouteOptions, toGuardRouteOptions]
  )

  const runGuard = useCallback(
    (guard: GuardMiddlewareFunction, prevCtxValue: any) => {
      return new Promise<GuardedResult<any>>((resolve, reject) => {
        let ctxValue: any
        let called = false
        const next: NextFunction<any> = (
          ...args: [To, NavigateOptions?] | [number] | []
        ) => {
          if (called) {
            return
          }
          called = true
          switch (args.length) {
            case 0:
              resolve({
                type: ResolvedStatus.NEXT,
                value: ctxValue,
              })
              break
            case 1:
              if (isNumber(args[0])) {
                resolve({
                  type: ResolvedStatus.GO,
                  delta: args[0],
                  value: ctxValue,
                })
              } else {
                resolve({
                  type: ResolvedStatus.TO,
                  to: args[0],
                  value: ctxValue,
                })
              }
              break
            case 2:
              resolve({
                type: ResolvedStatus.TO,
                to: args[0],
                options: args[1],
                value: ctxValue,
              })
              break
          }
        }
        next.value = prevCtxValue
        next.ctx = (value) => {
          ctxValue = value
          return next()
        }
        async function handleGuard() {
          await guard(toGuardRouteOptions, fromGuardRouteOptions, next)
        }
        try {
          handleGuard()
        } catch (error) {
          reject(error)
        }
      })
    },
    [fromGuardRouteOptions, toGuardRouteOptions]
  )

  const runGuards = useCallback(async () => {
    setValidated(false)
    let ctxValue: any
    for (const guard of guards) {
      let registered = true
      let guardHandle: GuardMiddlewareFunction
      if (isFunction(guard)) {
        guardHandle = guard
      } else {
        guardHandle = guard.handler
        if (guard.register) {
          registered = await guard.register(
            toGuardRouteOptions,
            fromGuardRouteOptions
          )
        }
      }
      if (!registered) {
        continue
      }
      const result = await runGuard(guardHandle, ctxValue)
      ctxValue = result.value
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
  }, [fromGuardRouteOptions, guards, navigate, runGuard, toGuardRouteOptions])

  const fallbackElement = useMemo(() => {
    return !isUndefined(fallbackProp) ? fallbackProp : fallback
  }, [fallback, fallbackProp])

  useEffect(() => {
    async function validate() {
      // validating lock for strict mode
      if (hasGuard && !validatingRef.current) {
        validatingRef.current = true
        await runGuards()
        validatingRef.current = false
      }
    }
    if (isPromise(canRunGuard)) {
      canRunGuard.then((done) => {
        if (done) {
          validate()
        } else {
          setValidated(true)
        }
      })
      return
    }
    if (canRunGuard) {
      validate()
    } else {
      setValidated(true)
    }
  }, [runGuards, hasGuard, enableGuards, canRunGuard, validated])
  if (hasGuard && !validated) {
    if (canRunFallback) {
      return <>{fallbackElement}</>
    }
    return null
  }
  return <>{children}</>
}
