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

You can provide GuardConfigProvider with multiple guards middleware for route guarding.

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
  next()
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
        {/* Guard all routes below. */}
        <GuardProvider fallback={<div>loading...</div>} guards={guards}>
          <GuardedRoutes>
            <GuardedRoute
              fallback={<div>loading foo...</div>}
              guards={fooGuard}
              element={<div>foo</div>}
              path="/foo"
            />
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

## APIS

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

export interface GuardedRouteObject extends RouteObject, GuardedRouteConfig {}

export interface NextFunction extends NavigateFunction {
  (): void
}

export interface GuardedRouteMatch<ParamKey extends string = string>
  extends Omit<RouteMatch<ParamKey>, 'route'> {
  route: GuardedRouteObject
}

export interface ToGuardRouteOptions {
  location: Location
  matches: GuardedRouteMatch[]
}

export interface FromGuardRouteOptions
  extends ReplacePick<
    ToGuardRouteOptions,
    ['location'],
    [ToGuardRouteOptions['location'] | null]
  > {}

export type GuardMiddleware = (
  to: ToGuardRouteOptions,
  from: FromGuardRouteOptions,
  next: NextFunction
) => Promise<void> | void
```

### Components

#### GuardConfigProvider

The GuardConfigProvider should not be used more than one in an app, make sure it's at the topmost level inside the Router (BrowserRouter and HashRouter).

And it provides APIs for whether to run guard middlewares and whether to display the fallback element:

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

| Prop             | Optional | Default | Description                             |
| ---------------- | :------: | :-----: | --------------------------------------- |
| `enableGuard`    |   Yes    |         | whether to run guard middlewares        |
| `enableFallback` |   Yes    |         | whether to display the fallback element |

#### GuardProvider

#### GuardedRoutes

#### GuardedRoute

### Hooks

#### useGuardedRoutes
