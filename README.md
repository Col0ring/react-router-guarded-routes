# React-Router-Guarded-Routes

A guard middleware for react-router v6, inspired by [`react-router-guards`](https://github.com/Upstatement/react-router-guards).

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
  console.log(to) // { location, matches }
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

const guards = [logGuard]
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

You can also call `next.ctx('ctx value')` to transfer contextual information, and get it by `next.value` in the next guard middleware. The guard middleware is executed from outside to inside, left to right.

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
        guards={(to, from, next) => {
          console.log(next.value) // ctx value
          next()
        }}
        element={<div>foo</div>}
        path="/foo"
      />
    </GuardedRoutes>
  </GuardProvider>
</GuardConfigProvider>
```

## APIS

### Types

```ts
import {
  Location,
  NavigateFunction,
  RouteMatch,
  RouteObject,
} from 'react-router'

export interface GuardedRouteConfig {
  guards?: GuardMiddleware[]
  fallback?: React.ReactNode
  [props: PropertyKey]: any
}

export interface GuardedRouteObject extends RouteObject, GuardedRouteConfig {}

// extends the navigate function
export interface NextFunction<T> extends NavigateFunction {
  (): void
  value: T
  ctx: (value: T) => void
}

export interface GuardedRouteMatch<ParamKey extends string = string>
  extends Omit<RouteMatch<ParamKey>, 'route'> {
  route: GuardedRouteObject
}

export interface ToGuardRouteOptions {
  location: Location
  matches: GuardedRouteMatch[]
}

export interface FromGuardRouteOptions {
  location: Location | null
  matches: GuardedRouteMatch[]
}

export type GuardMiddleware<T = any> = (
  to: ToGuardRouteOptions,
  from: FromGuardRouteOptions,
  next: NextFunction<T>
) => Promise<void> | void
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
  guards?: GuardedRouteConfig['guards']
  children: React.ReactNode
}
```

| Prop       | Optional | Default | Description                                                           |
| ---------- | :------: | :-----: | --------------------------------------------------------------------- |
| `fallback` |   Yes    |         | a fallback element to show when a `GuardedRoute` run guard middleware |
| `guards`   |   Yes    |         | the guards to set for routes inside the `GuardProvider`               |

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
