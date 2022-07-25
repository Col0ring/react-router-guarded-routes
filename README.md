# React-Router-Guarded-Routes

A guard middleware for react-router v6, inspired by [`react-router-guards`](https://github.com/Upstatement/react-router-guards).

- [Install](#install)
- [Usage](#usage)
  - [Basic](#basic)
  - [Guarding](#guarding)
- [API](#api)
  - [Types](#types)
  - [Components](#components)
    - [GuardConfigProvider](#guardconfigprovider)
      - [Props](#props)
      - [Setup](#setup)
    - [GuardProvider](#guardprovider)
      - [Props](#props-1)
      - [Setup](#setup-1)
    - [GuardedRoutes](#guardedroutes)
      - [Props](#props-2)
      - [Setup](#setup-2)
    - [GuardedRoute](#guardedroute)
      - [Props](#props-3)
      - [Setup](#setup-3)
  - [Hooks](#hooks)
    - [useGuardedRoutes](#useguardedroutes)
      - [Props](#props-4)
      - [Setup](#setup-4)

## Install

```sh
npm install react-router-guarded-routes react-router --save
# or
yarn add react-router-guarded-routes react-router
# or
pnpm add react-router-guarded-routes react-router
```

## Usage

### Basic

Provides `GuardConfigProvider`, and you can use it like `react-router` (compatible with the apis of `react-router`).

```tsx
import { BrowserRouter } from 'react-router-dom'
import {
  GuardConfigProvider,
  GuardedRoute,
  GuardedRoutes,
} from 'react-router-guarded-routes'

export default function App() {
  return (
    <BrowserRouter>
      <GuardConfigProvider>
        <GuardedRoutes>
          <GuardedRoute element={<div>foo</div>} path="/foo" />
          <GuardedRoute element={<div>bar</div>} path="/bar/*">
            <GuardedRoute element={<div>baz</div>} path="/bar/baz" />
          </GuardedRoute>
        </GuardedRoutes>
      </GuardConfigProvider>
    </BrowserRouter>
  )
}
```

Use hooks:

```tsx
import {
  GuardedRouteObject,
  useGuardedRoutes,
} from 'react-router-guarded-routes'

const routes: GuardedRouteObject[] = [
  { path: '/foo', element: <div>foo</div> },
  {
    path: '/bar/*',
    element: <div>bar</div>,
    children: [{ path: '/bar/baz', element: <div>baz</div> }],
  },
]

function Routes() {
  return <GuardedRoutes>{useGuardedRoutes([routes])}</GuardedRoutes>
}

export default function App() {
  return (
    <BrowserRouter>
      <GuardConfigProvider>
        <Routes />
      </GuardConfigProvider>
    </BrowserRouter>
  )
}
```

### Guarding

You can provide `GuardConfigProvider` with multiple guards middleware for route guarding.

```tsx
import { BrowserRouter } from 'react-router-dom'
import {
  GuardConfigProvider,
  GuardedRoute,
  GuardedRoutes,
  GuardMiddleware,
  GuardProvider,
} from 'react-router-guarded-routes'

const logGuard: GuardMiddleware = (to, from, next) => {
  console.log(to) // { location, matches, route }
  console.log(from)
  next() // call next function to show the route element
  // it accepts the same parameters as navigate (useNavigate()) and behaves consistently.
}

const guards = [logGuard]

export default function App() {
  return (
    <BrowserRouter>
      <GuardConfigProvider>
        {/* Guard all routes below. */}
        <GuardProvider fallback={<div>loading...</div>} guards={guards}>
          <GuardedRoutes>
            <GuardedRoute element={<div>foo</div>} path="/foo" />
            <GuardedRoute element={<div>bar</div>} path="/bar/*">
              <GuardedRoute element={<div>baz</div>} path="/bar/baz" />
            </GuardedRoute>
          </GuardedRoutes>
        </GuardProvider>
      </GuardConfigProvider>
    </BrowserRouter>
  )
}
```

Of course, you can also set up separate fallbacks and guards for each route.

```tsx
import { BrowserRouter, Outlet } from 'react-router-dom'
import {
  GuardConfigProvider,
  GuardedRoute,
  GuardedRoutes,
  GuardMiddleware,
  GuardProvider,
} from 'react-router-guarded-routes'

const logGuard: GuardMiddleware = (to, from, next) => {
  console.log(to, from)
  next()
}

const fooGuard: GuardMiddleware = (to, from, next) => {
  console.log('foo')
  next()
}

// you can use object to determine whether you need to register middleware
const barGuard: GuardMiddleware = {
  handler: (to, from, next) => {
    console.log('bar')
    next()
  },
  register: (to, from) => {
    // only matched with `/bar` can be executed.å
    if (to.location.pathname.startsWith('/bar')) {
      return true
    }
    return false
  },
}

const guards = [logGuard, barGuard]
const fooGuards = [fooGuard]

export default function App() {
  return (
    <BrowserRouter>
      <GuardConfigProvider>
        <GuardProvider fallback={<div>loading...</div>} guards={guards}>
          <GuardedRoutes>
            <GuardedRoute
              fallback={<div>loading foo...</div>}
              guards={fooGuard}
              element={<div>foo</div>}
              path="/foo"
            />
            <GuardedRoute
              element={
                <div>
                  bar
                  <Outlet />
                </div>
              }
              path="/bar/*"
            >
              <GuardedRoute element={<div>baz</div>} path="/bar/baz" />
            </GuardedRoute>
          </GuardedRoutes>
        </GuardProvider>
      </GuardConfigProvider>
    </BrowserRouter>
  )
}
```

You can also call `next.ctx('ctx value')` to transfer contextual information, and get it by `ctxValue` in the next guard middleware. The guard middleware is executed from outside to inside, left to right.

```tsx
<GuardConfigProvider>
  <GuardProvider
    fallback={<div>loading...</div>}
    guards={(to, from, next) => {
      next.ctx('ctx value')
    }}
  >
    <GuardedRoutes>
      <GuardedRoute
        guards={(to, from, next, { ctxValue }) => {
          console.log(ctxValue) // ctx value
          next()
        }}
        element={<div>foo</div>}
        path="/foo"
      />
    </GuardedRoutes>
  </GuardProvider>
</GuardConfigProvider>
```

And call `next.end()` to ignore remaining middleware.

```tsx
<GuardConfigProvider>
  <GuardProvider
    fallback={<div>loading...</div>}
    guards={
      ((to, from, next) => {
        next.end()
      },
      () => {
        console.log('will not be called')
      })
    }
  >
    <GuardedRoutes>
      <GuardedRoute
        guards={() => {
          console.log('will not be called')
        }}
        element={<div>foo</div>}
        path="/foo"
      />
    </GuardedRoutes>
  </GuardProvider>
</GuardConfigProvider>
```

## API

### Types

```ts
import {
  Location,
  NavigateFunction,
  RouteMatch,
  RouteObject,
} from 'react-router'
import { ReplacePick } from 'types-kit'

export interface GuardedRouteConfig {
  guards?: GuardMiddleware[]
  fallback?: React.ReactNode
  [props: PropertyKey]: any
}

export interface GuardedRouteObject extends RouteObject, GuardedRouteConfig {
  children?: GuardedRouteObject[]
}

export interface NextFunction<T> extends NavigateFunction {
  (): void
  ctx: (value: T) => void
  end: () => void
}

export interface GuardedRouteMatch<ParamKey extends string = string>
  extends Omit<RouteMatch<ParamKey>, 'route'> {
  route: GuardedRouteObject
}

export interface ToGuardRouteOptions {
  location: Location
  matches: GuardedRouteMatch[]
  route: GuardedRouteObject
}

export interface FromGuardRouteOptions
  extends ReplacePick<
    ToGuardRouteOptions,
    ['location', 'route'],
    [
      ToGuardRouteOptions['location'] | null,
      ToGuardRouteOptions['route'] | null
    ]
  > {}

export interface ExternalOptions<T, I> {
  ctxValue: T
  injectedValue: I
}

export type GuardMiddlewareFunction<T = any, I = any> = (
  to: ToGuardRouteOptions,
  from: FromGuardRouteOptions,
  next: NextFunction<T>,
  externalOptions: ExternalOptions<T, I>
) => Promise<void> | void

export type GuardMiddlewareObject<T = any, I = any> = {
  handler: GuardMiddlewareFunction<T, I>
  register?: (
    to: ToGuardRouteOptions,
    from: FromGuardRouteOptions
  ) => Promise<boolean> | boolean
}
export type GuardMiddleware<T = any, I = any> =
  | GuardMiddlewareFunction<T, I>
  | GuardMiddlewareObject<T, I>
```

### Components

#### GuardConfigProvider

The `GuardConfigProvider` should not be used more than one in an app, make sure it's at the topmost level inside the Router (`BrowserRouter` and `HashRouter`).

And it provides APIs for whether to run guard middleware and whether to display the fallback element:

##### Props

```tsx
import React from 'react'

export interface GuardConfigProviderProps {
  enableGuard?: (
    location: ToGuardRouteOptions,
    prevLocation: FromGuardRouteOptions
  ) => Promise<boolean> | boolean
  enableFallback?: (
    location: ToGuardRouteOptions,
    prevLocation: FromGuardRouteOptions
  ) => boolean
  children: React.ReactNode
}
```

| Prop             | Optional |                            Default                             | Description                             |
| ---------------- | :------: | :------------------------------------------------------------: | --------------------------------------- |
| `enableGuards`   |   Yes    | (to, from) => to.location.pathname !== from.location?.pathname | whether to run guard middleware         |
| `enableFallback` |   Yes    |                           () => true                           | whether to display the fallback element |

##### Setup

```tsx
import { BrowserRouter } from 'react-router-dom'
import { GuardConfigProvider } from 'react-router-guarded-routes'
export default function App() {
  return (
    <BrowserRouter>
      <GuardConfigProvider>
        {
          // routes
        }
      </GuardConfigProvider>
    </BrowserRouter>
  )
}
```

#### GuardProvider

It provides public fallback element and guard middleware for `GuardedRoute`.

##### Props

```tsx
import React from 'react'

export interface GuardProviderProps {
  fallback?: React.ReactElement
  inject?: (
    to: ToGuardRouteOptions,
    from: FromGuardRouteOptions
  ) => Record<string, any>
  guards?: GuardedRouteConfig['guards']
  children: React.ReactNode
}
```

| Prop       | Optional | Default | Description                                                                                                                                |
| ---------- | :------: | :-----: | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `fallback` |   Yes    |         | a fallback element to show when a `GuardedRoute` run guard middleware                                                                      |
| `inject`   |   Yes    |  `{}`   | an injected value (React hooks can be used) for guard middleware to use, will be automatically merged the values of nested `GuardProvider` |
| `guards`   |   Yes    |         | the guards to set for routes inside the `GuardProvider`                                                                                    |

##### Setup

```tsx
import { BrowserRouter } from 'react-router-dom'
import {
  GuardConfigProvider,
  GuardedRoute,
  GuardedRoutes,
  GuardMiddleware,
  GuardProvider,
} from 'react-router-guarded-routes'

const logGuard: GuardMiddleware = (to, from, next) => {
  console.log(to, from)
  next()
}

export default function App() {
  return (
    <BrowserRouter>
      <GuardConfigProvider>
        <GuardProvider fallback={<div>loading...</div>} guards={[logGuard]}>
          <GuardedRoutes>
            <GuardedRoute element={<div>foo</div>} path="/foo" />
          </GuardedRoutes>
        </GuardProvider>
      </GuardConfigProvider>
    </BrowserRouter>
  )
}
```

Use nested GuardProvider:

```tsx
<GuardConfigProvider>
  <GuardProvider fallback={<div>loading...</div>}>
    <GuardedRoutes>
      <GuardedRoute element={<div>foo</div>} path="/foo" />
      <GuardProvider fallback={<div>loading2...</div>}>
        <GuardedRoute
          element={
            <div>
              bar
              <Outlet />
            </div>
          }
          path="/bar/*"
        >
          <GuardedRoute element={<div>baz</div>} path="/bar/baz" />
        </GuardedRoute>
      </GuardProvider>
    </GuardedRoutes>
  </GuardProvider>
</GuardConfigProvider>
```

Inject value:

```tsx
import { createContext } from 'react'
import { BrowserRouter } from 'react-router-dom'
import {
  GuardConfigProvider,
  GuardedRoute,
  GuardedRoutes,
  GuardProvider,
} from 'react-router-guarded-routes'

export const AuthContext = createContext({
  isLogin: false,
})

export function useAuth() {
  return useContext(AuthContext)
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthContext>
        <GuardConfigProvider>
          <GuardProvider
            fallback={<div>loading...</div>}
            inject={useAuth}
            guards={[
              (to, from, next, { injectedValue }) => {
                console.log(injectedValue) // { isLogin: false }
                next()
              },
            ]}
          >
            <GuardedRoutes>
              <GuardedRoute element={<div>foo</div>} path="/foo" />
            </GuardedRoutes>
          </GuardProvider>
        </GuardConfigProvider>
      </AuthContext>
    </BrowserRouter>
  )
}
```

#### GuardedRoutes

The `GuardedRoutes` component acts as a replacement for the default `Routes` component provided by React Router.

##### Props

```tsx
import { RoutesProps } from 'react-router'

export interface GuardedRoutesProps extends RoutesProps {}
```

##### Setup

```tsx
<BrowserRouter>
  <GuardConfigProvider>
    <GuardedRoutes>
      <GuardedRoute element={<div>foo</div>} path="/foo" />
    </GuardedRoutes>
  </GuardConfigProvider>
</BrowserRouter>
```

#### GuardedRoute

The `GuardedRoute` component acts as a replacement for the default `Route` component provided by React Router, allowing for routes to use guard middleware and accepting the same props as regular `Route`.

##### Props

```tsx
import { Route } from 'react-router'
type RouteProps = Parameters<typeof Route>[0]

export type GuardedRouteProps = RouteProps & GuardedRouteConfig
```

The following table explains the guard-specific props for this component.

| Prop       | Optional | Default | Description                                                                                                                        |
| ---------- | :------: | :-----: | ---------------------------------------------------------------------------------------------------------------------------------- |
| `fallback` |   Yes    |         | a fallback element to show when a `GuardedRoute` run guard middleware. (it will override the fallback provided by `GuardProvider`) |
| `guards`   |   Yes    |         | the guards to set for the route                                                                                                    |

##### Setup

```tsx
<GuardedRoutes>
  <GuardedRoute
    element={<div>foo</div>}
    path="/foo"
    fallback={<div>loading...</div>}
    guards={[
      (to, from, next) => {
        next()
      },
    ]}
  />
</GuardedRoutes>
```

### Hooks

#### useGuardedRoutes

The `useGuardedRoutes` hook acts as a replacement for the default `useRoutes` hook provided by React Router, and additionally provides `fallback` and `guards` properties for each member.

##### Props

```tsx
import { useRoutes } from 'react-router'

type LocationArg = Parameters<typeof useRoutes>[1]

export function useGuardedRoutes(
  guardedRoutes: GuardedRouteObject[],
  locationArg?: LocationArg
): ReturnType<typeof useRoutes>
```

##### Setup

```tsx
import {
  GuardedRouteObject,
  useGuardedRoutes,
} from 'react-router-guarded-routes'
const routes: GuardedRouteObject[] = [
  {
    path: '/foo',
    element: <div>foo</div>,
    fallback: <div>loading foo...</div>,
    guards: [(to, from, next) => next()],
  },
]

function Routes() {
  return <>{useGuardedRoutes(routes)}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <GuardConfigProvider>
        <GuardProvider fallback={<div>loading...</div>}>
          <Routes>
        </GuardProvider>
      </GuardConfigProvider>
    </BrowserRouter>
  )
}
```
