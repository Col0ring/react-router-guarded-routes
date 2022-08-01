# React-Router-Guarded-Routes

> [English](./README.md) | 简体中文

一个用于 react-router v6 的路由守卫中间件，该中间件受到 [`react-router-guards`](https://github.com/Upstatement/react-router-guards) 启发。

- [下载](#下载)
- [使用](#使用)
  - [基本使用](#基本使用)
  - [路由守卫](#路由守卫)
- [API](#api)
  - [类型](#类型)
  - [组件](#组件)
    - [GuardConfigProvider](#guardconfigprovider)
      - [属性](#属性)
      - [开始使用](#开始使用)
    - [GuardProvider](#guardprovider)
      - [属性](#属性-1)
      - [开始使用](#开始使用-1)
    - [GuardedRoutes](#guardedroutes)
      - [属性](#属性-2)
      - [开始使用](#开始使用-2)
    - [GuardedRoute](#guardedroute)
      - [属性](#属性-3)
      - [开始使用](#开始使用-3)
  - [Hooks](#hooks)
    - [useGuardedRoutes](#useguardedroutes)
      - [属性](#属性-4)
      - [开始使用](#开始使用-4)

## 下载

```sh
npm install react-router-guarded-routes react-router --save
# or
yarn add react-router-guarded-routes react-router
# or
pnpm add react-router-guarded-routes react-router
```

## 使用

### 基本使用

在 `BrowserRouter` 内部使用该库提供的 `GuardConfigProvider` 组件，然后像使用`react-router`一样使用它（适配 `react-router` 的 api）。

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

使用 hooks:

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

### 路由守卫

你可以通过在 `GuardProvider` 组件中使用多个中间件来进行路由守卫，`GuardProvider` 可以接收一个 guards 数组和一个 fallback 元素（可以用于加载 loading 态）。

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
  next() // 调用 next() 来执行下一个中间件或者显示路由元素，它接受与 navigate（useNavigate()）相同的参数并且行为一致。
}

const guards = [logGuard]

// 也可以传入对象来判断是否需要注册中间件
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

当然，你也可以分别为每个路由设置 fallback 和路由守卫。

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

通过调用 `next.ctx('ctx value')` 来传递上下文信息，在下一个守卫中间件中通过 `ctxValue` 获取。 守卫中间件从外到内，从左到右执行。

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

调用 `next.end()` 来忽略后续中间件。

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

### 类型

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

### 组件

#### GuardConfigProvider

`GuardConfigProvider` 包含有整个路由相关的配置项，不应该在应用中存在多个，请确保它位于路由器内部的最顶层（`BrowserRouter` 和 `HashRouter`）。

并且它提供了是否运行保护中间件以及是否显示回退元素的 API：

##### 属性

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

| 属性             | 可选 |                             默认值                             | 描述                   |
| ---------------- | :--: | :------------------------------------------------------------: | ---------------------- |
| `enableGuards`   |  是  | (to, from) => to.location.pathname !== from.location?.pathname | 是否执行中间件         |
| `enableFallback` |  是  |                           () => true                           | 是否展示 fallback 元素 |

##### 开始使用

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

为 `GuardedRoute` 提供公共的 `fallback` 元素守卫中间件。

##### 属性

```tsx
import React from 'react'

export interface GuardProviderProps {
  fallback?: React.ReactElement
  useInject?: (
    to: ToGuardRouteOptions,
    from: FromGuardRouteOptions
  ) => Record<string, any>
  guards?: GuardedRouteConfig['guards']
  children: React.ReactNode
}
```

| 属性        | 可选 | 默认值 | 描述                                                                                                     |
| ----------- | :--: | :----: | -------------------------------------------------------------------------------------------------------- |
| `fallback`  |  是  |        | 当 `GuardedRoute` 运行守卫中间件时显示的替代元素                                                         |
| `useInject` |  是  |        | 一个可供守卫中间件使用的注入值（可以在内部使用 hooks），会自动合并嵌套 `GuardProvider` 的 `useInject` 值 |
| `guards`    |  是  |        | 公共的路由守卫                                                                                           |

##### 开始使用

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

使用嵌套的 `GuardProvider`：

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

注入值：

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
            useInject={useAuth}
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

使用 `GuardedRoutes` 组件来替代 React Router 默认提供的 `Routes` 组件。

##### 属性

```tsx
import { RoutesProps } from 'react-router'

export interface GuardedRoutesProps extends RoutesProps {}
```

##### 开始使用

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

使用 `GuardedRoute` 组件来替代 React Router 默认提供的 `Route` 组件，它允许额外接收守卫中间件与 fallback 元素作为属性。

##### 属性

```tsx
import { Route } from 'react-router'
type RouteProps = Parameters<typeof Route>[0]

export type GuardedRouteProps = RouteProps & GuardedRouteConfig
```

下表包含该组件独有的属性：

| 属性       | 可选 | 默认值 | 描述                                                                                      |
| ---------- | :--: | :----: | ----------------------------------------------------------------------------------------- |
| `fallback` |  是  |        | 当 `GuardedRoute` 运行守卫中间件时显示的替代元素. (会覆盖`GuardProvider`提供的 fallback） |
| `guards`   |  是  |        | 路由守卫                                                                                  |

##### 开始使用

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

使用 `useGuardedRoutes` 可以来替代 React Router 默认提供的 `useRoutes` ，它为每个成员额外提供了 `fallback` 与 `guards` 属性。

##### 属性

```tsx
import { useRoutes } from 'react-router'

type LocationArg = Parameters<typeof useRoutes>[1]

export function useGuardedRoutes(
  guardedRoutes: GuardedRouteObject[],
  locationArg?: LocationArg
): ReturnType<typeof useRoutes>
```

##### 开始使用

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
