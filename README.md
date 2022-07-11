# React-Router-Guarded-Routes

A guard middleware for react-router v6, inspired by [`react-router-guards`](https://github.com/Upstatement/react-router-guards)

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

const logGuard: GuardMiddleware = (to, from, next, { route }) => {
  console.log(to, from) // to Location (see react-router), from Location.
  console.log(route) // the GuardedRouteObject.
  // run the next middleware.
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

const logGuard: GuardMiddleware = (to, from, next, { route }) => {
  console.log(to, from) // to Location (see react-router), from Location.
  console.log(route) // the GuardedRouteObject.
  // run the next middleware.
  next()
}

const fooGuard: GuardMiddleware = (to, from, next, { route }) => {
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

### Components

#### GuardConfigProvider

#### GuardProvider

#### GuardedRoutes

#### GuardedRoute

### Hooks

#### useGuardedRoutes

### Types

```ts
import { Location, NavigateFunction, RouteObject } from 'react-router'

export interface GuardedRouteConfig {
  guards?: GuardMiddleware[]
  fallback?: React.ReactNode
  [props: PropertyKey]: any
}

export interface GuardedRouteObject extends RouteObject, GuardedRouteConfig {}

export interface NextFunction extends NavigateFunction {
  (): void
}
export interface GuardMiddlewareOptions {
  route: GuardedRouteObject
}

export type GuardMiddleware = (
  to: Location,
  from: Location | null,
  next: NextFunction,
  options: GuardMiddlewareOptions
) => Promise<void> | void
```
