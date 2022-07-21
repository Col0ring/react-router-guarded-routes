import { MemoryRouter, useNavigate } from 'react-router'
import type { ReactTestRenderer } from 'react-test-renderer'
import TestRenderer from 'react-test-renderer'
import {
  GuardConfigProvider,
  GuardConfigProviderProps,
  GuardedRouteObject,
  useGuardedRoutes,
} from '../src'
import { createPromiseHandler, noop } from './utils'

function RoutesRenderer({
  routes,
  ...props
}: { routes: GuardedRouteObject[] } & Omit<
  GuardConfigProviderProps,
  'children'
>) {
  return (
    <GuardConfigProvider {...props}>
      {useGuardedRoutes(routes)}
    </GuardConfigProvider>
  )
}

beforeAll(() => {
  jest.useFakeTimers()
})

afterAll(() => {
  jest.useRealTimers()
})

describe('<GuardConfigProvider />', () => {
  it('should enable guard middleware and fallback element and by default', async () => {
    await TestRenderer.act(async () => {
      const routes: GuardedRouteObject[] = [
        {
          path: 'home',
          element: <h1>home</h1>,
          fallback: <div>loading...</div>,
          guards: [() => {}],
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

      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <div>
          loading...
        </div>
      `)
    })
  })

  describe('enableFallback', () => {
    it('always return false', async () => {
      await TestRenderer.act(async () => {
        const routes: GuardedRouteObject[] = [
          {
            path: 'home',
            element: <h1>home</h1>,
            fallback: <div>loading...</div>,
            guards: [() => {}],
          },
        ]

        let renderer!: ReactTestRenderer
        await TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/home']}>
              <RoutesRenderer routes={routes} enableFallback={() => false} />
            </MemoryRouter>
          )
        })

        expect(renderer.toJSON()).toBeNull()
      })
    })

    it('should render fallback element when the path is matched', async () => {
      await TestRenderer.act(async () => {
        const promiseHandler = createPromiseHandler()
        const routes: GuardedRouteObject[] = [
          {
            path: 'home',
            element: <h1>home</h1>,
            fallback: <div>loading...</div>,
            guards: [
              (to, from, next) => {
                setTimeout(() => {
                  next('/about')
                  promiseHandler.call()
                }, 2000)
              },
            ],
          },
          {
            path: 'about',
            element: <h1>about</h1>,
            fallback: <div>loading...</div>,
            guards: [noop],
          },
        ]

        let renderer!: ReactTestRenderer
        await TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/home']}>
              <RoutesRenderer
                routes={routes}
                enableFallback={(to) => to.location.pathname === '/about'}
              />
            </MemoryRouter>
          )
        })

        expect(renderer.toJSON()).toBeNull()
        jest.runAllTimers()
        // await a micro task
        await promiseHandler.promise
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            loading...
          </div>
        `)
      })
    })
  })

  describe('enableGuards', () => {
    it('always return false', async () => {
      await TestRenderer.act(async () => {
        const routes: GuardedRouteObject[] = [
          {
            path: 'home',
            element: <h1>home</h1>,
            fallback: <div>loading...</div>,
            guards: [() => {}],
          },
        ]

        let renderer!: ReactTestRenderer
        await TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/home']}>
              <RoutesRenderer routes={routes} enableGuards={() => false} />
            </MemoryRouter>
          )
        })

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            home
          </h1>
        `)
      })
    })

    it('should run guards when the path is matched', async () => {
      function Home() {
        const navigate = useNavigate()
        return (
          <div>
            home
            <button onClick={() => navigate('/about')}>Click</button>
          </div>
        )
      }
      await TestRenderer.act(async () => {
        const routes: GuardedRouteObject[] = [
          {
            path: 'home',
            element: <Home />,
            fallback: <div>loading...</div>,
            guards: [noop],
          },
          {
            path: 'about',
            element: <h1>about</h1>,
            fallback: <div>loading...</div>,
            guards: [noop],
          },
        ]

        let renderer!: ReactTestRenderer
        await TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/home']}>
              <RoutesRenderer
                routes={routes}
                enableGuards={(to) => to.location.pathname === '/about'}
              />
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
  })
})
