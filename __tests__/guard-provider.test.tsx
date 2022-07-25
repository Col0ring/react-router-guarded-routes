import { createContext, useContext } from 'react'
import { MemoryRouter, Outlet, useNavigate } from 'react-router'
import type { ReactTestRenderer } from 'react-test-renderer'
import TestRenderer from 'react-test-renderer'
import {
  GuardConfigProvider,
  GuardedRouteObject,
  GuardProvider,
  useGuardedRoutes,
} from '../src'
import { createPromiseHandler, noop } from './utils'

function RoutesRenderer({ routes }: { routes: GuardedRouteObject[] }) {
  return <GuardConfigProvider>{useGuardedRoutes(routes)}</GuardConfigProvider>
}

beforeAll(() => {
  jest.useFakeTimers()
})

afterAll(() => {
  jest.useRealTimers()
})

let consoleLog!: jest.SpyInstance

beforeEach(() => {
  consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
  consoleLog.mockRestore()
})

describe('<GuardProvider />', () => {
  it('should render the fallback element provided by <GuardProvider /> when a route does not have a fallback element', () => {
    const routes: GuardedRouteObject[] = [
      {
        element: (
          <GuardProvider fallback={<div>loading...</div>}>
            <Outlet />
          </GuardProvider>
        ),
        children: [{ path: 'home', element: <h1>home</h1>, guards: [noop] }],
      },
    ]

    let renderer!: ReactTestRenderer
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MemoryRouter initialEntries={['/home']}>
          <RoutesRenderer routes={routes} />
        </MemoryRouter>
      )
    })
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div>
        loading...
      </div>
    `)
  })

  it('should render the fallback element provided by a route when it has a fallback element', () => {
    const routes: GuardedRouteObject[] = [
      {
        element: (
          <GuardProvider fallback={<div>loading...</div>}>
            <Outlet />
          </GuardProvider>
        ),
        children: [
          {
            path: 'home',
            element: <h1>home</h1>,
            guards: [noop],
            fallback: <div>loading home...</div>,
          },
        ],
      },
    ]

    let renderer!: ReactTestRenderer
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MemoryRouter initialEntries={['/home']}>
          <RoutesRenderer routes={routes} />
        </MemoryRouter>
      )
    })
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div>
        loading home...
      </div>
    `)
  })

  it('should run guard middleware provided by <GuardProvider />', async () => {
    const promiseHandler = createPromiseHandler()
    let renderer!: ReactTestRenderer
    await TestRenderer.act(async () => {
      const routes: GuardedRouteObject[] = [
        {
          element: (
            <GuardProvider
              guards={[
                (to, from, next) => {
                  if (to.location.pathname !== '/about') {
                    setTimeout(() => {
                      next('/about')
                    }, 2000)
                  } else {
                    promiseHandler.call()
                    next()
                  }
                },
              ]}
              fallback={<div>loading...</div>}
            >
              <Outlet />
            </GuardProvider>
          ),
          children: [
            {
              path: 'home',
              element: <h1>home</h1>,
            },
            {
              path: 'about',
              element: <h1>about</h1>,
            },
          ],
        },
      ]

      await TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/home']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>
        )
      })
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <div>
          loading...
        </div>
      `)
      jest.runAllTimers()
    })
    // await a micro task
    await promiseHandler.promise
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <h1>
        about
      </h1>
    `)
  })

  it('show get the injected value', async () => {
    const state = {
      isLogin: false,
    }
    const AuthContext = createContext(state)
    function useAuth() {
      return useContext(AuthContext)
    }
    await TestRenderer.act(async () => {
      const routes: GuardedRouteObject[] = [
        {
          element: (
            <GuardProvider
              guards={[
                (to, from, next, { injectedValue }) => {
                  // eslint-disable-next-line no-console
                  console.log(JSON.stringify(injectedValue))
                  next()
                },
              ]}
              fallback={<div>loading...</div>}
              inject={useAuth}
            >
              <Outlet />
            </GuardProvider>
          ),
          children: [{ path: 'home', element: <h1>home</h1>, guards: [noop] }],
        },
      ]

      await TestRenderer.act(() => {
        TestRenderer.create(
          <MemoryRouter initialEntries={['/home']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>
        )
      })
      expect(consoleLog).toHaveBeenCalledWith(
        expect.stringContaining(JSON.stringify(state))
      )
    })
  })

  it('should get the ctx value', async () => {
    await TestRenderer.act(async () => {
      const routes: GuardedRouteObject[] = [
        {
          element: (
            <GuardProvider
              guards={[
                (to, from, next) => {
                  next.ctx('ctx value')
                },
              ]}
              fallback={<div>loading...</div>}
            >
              <Outlet />
            </GuardProvider>
          ),
          children: [
            {
              path: 'home',
              element: <h1>home</h1>,
              guards: [
                (to, from, next, { ctxValue }) => {
                  console.log(ctxValue)
                  next()
                },
              ],
            },
          ],
        },
      ]

      await TestRenderer.act(() => {
        TestRenderer.create(
          <MemoryRouter initialEntries={['/home']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>
        )
      })
      expect(consoleLog).toHaveBeenCalledWith(
        expect.stringContaining('ctx value')
      )
    })
  })

  it('should ignore remaining middleware if `next.end()` is called', async () => {
    await TestRenderer.act(async () => {
      const routes: GuardedRouteObject[] = [
        {
          element: (
            <GuardProvider
              guards={[
                (to, from, next) => {
                  next.end()
                },
              ]}
              fallback={<div>loading...</div>}
            >
              <Outlet />
            </GuardProvider>
          ),
          children: [
            {
              path: 'home',
              element: <h1>home</h1>,
              guards: [
                () => {
                  console.log('home guard')
                },
              ],
            },
          ],
        },
      ]
      let renderer!: ReactTestRenderer
      await TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/home']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>
        )
      })
      expect(consoleLog).not.toHaveBeenCalled()
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <h1>
          home
        </h1>
      `)
    })
  })

  it('should register a guard middleware when matched a route', async () => {
    function Home() {
      const navigate = useNavigate()
      return (
        <div>
          home
          <button onClick={() => navigate('/about')}>Click</button>
        </div>
      )
    }
    let renderer!: ReactTestRenderer

    await TestRenderer.act(async () => {
      const routes: GuardedRouteObject[] = [
        {
          element: (
            <GuardProvider
              guards={[
                {
                  handler: () => {},
                  register(to) {
                    if (to.location.pathname === '/about') {
                      return true
                    }
                    return false
                  },
                },
              ]}
              fallback={<div>loading...</div>}
            >
              <Outlet />
            </GuardProvider>
          ),
          children: [
            {
              path: 'home',
              element: <Home />,
            },
            {
              path: 'about',
              element: <h1>about</h1>,
            },
          ],
        },
      ]

      await TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/home']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>
        )
      })
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <div>
          home
          <button
            onClick={[Function]}
          >
            Click
          </button>
        </div>
      `)
    })
    await TestRenderer.act(async () => {
      const button = renderer.root.findByType('button')
      await TestRenderer.act(() => {
        button.props.onClick()
      })
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
            <div>
              loading...
            </div>
        `)
    })
  })

  it('should include all guard middleware when there are nested providers', async () => {
    await TestRenderer.act(async () => {
      const routes: GuardedRouteObject[] = [
        {
          element: (
            <GuardProvider
              fallback={<div>loading...</div>}
              guards={[
                (to, from, next) => {
                  // eslint-disable-next-line no-console
                  console.log('guard 1')
                  next()
                },
              ]}
            >
              <Outlet />
            </GuardProvider>
          ),
          children: [
            {
              element: (
                <GuardProvider
                  fallback={<div>loading2...</div>}
                  guards={[
                    (to, from, next) => {
                      // eslint-disable-next-line no-console
                      console.log('guard 2')
                      next()
                    },
                  ]}
                >
                  <Outlet />
                </GuardProvider>
              ),
              children: [{ path: 'home', element: <h1>home</h1> }],
            },
          ],
        },
      ]

      await TestRenderer.act(() => {
        TestRenderer.create(
          <MemoryRouter initialEntries={['/home']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>
        )
      })
    })
    expect(consoleLog).toHaveBeenCalledTimes(3)
    expect(consoleLog).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(`guard 1`)
    )
    expect(consoleLog).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining(`guard 1`)
    )
    expect(consoleLog).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining(`guard 2`)
    )
  })
})
