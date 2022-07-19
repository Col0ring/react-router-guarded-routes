import { MemoryRouter } from 'react-router'
import type { ReactTestRenderer } from 'react-test-renderer'
import TestRenderer from 'react-test-renderer'
import {
  GuardConfigProvider,
  GuardedRouteObject,
  useGuardedRoutes,
} from '../src'
import { createPromiseHandler } from './utils'

function RoutesRenderer({
  routes,
  location,
}: {
  routes: GuardedRouteObject[]
  location?: Partial<Location> & { pathname: string }
}) {
  return (
    <GuardConfigProvider>
      {useGuardedRoutes(routes, location)}
    </GuardConfigProvider>
  )
}

beforeAll(() => {
  jest.useFakeTimers()
})

afterAll(() => {
  jest.useRealTimers()
})

describe('useGuardedRoutes', () => {
  it('returns the matching element from a route config', () => {
    const routes: GuardedRouteObject[] = [
      { path: 'home', element: <h1>home</h1> },
      { path: 'about', element: <h1>about</h1> },
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
      <h1>
        home
      </h1>
    `)
  })

  it('uses the `location` prop instead of context location`', () => {
    const routes: GuardedRouteObject[] = [
      { path: 'one', element: <h1>one</h1> },
      { path: 'two', element: <h1>two</h1> },
    ]

    let renderer!: TestRenderer.ReactTestRenderer
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MemoryRouter initialEntries={['/one']}>
          <RoutesRenderer routes={routes} location={{ pathname: '/two' }} />
        </MemoryRouter>
      )
    })

    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <h1>
        two
      </h1>
    `)
  })

  describe('render with guards', () => {
    describe('when a guard does not call the `next()` function', () => {
      it('should render `null` when not has a fallback element', () => {
        const routes: GuardedRouteObject[] = [
          { path: 'home', element: <h1>home</h1>, guards: [() => {}] },
        ]

        let renderer!: ReactTestRenderer
        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/home']}>
              <RoutesRenderer routes={routes} />
            </MemoryRouter>
          )
        })
        expect(renderer.toJSON()).toBeNull()
      })

      it('show render the fallback element when pass a fallback element as a parameter', () => {
        const routes: GuardedRouteObject[] = [
          {
            path: 'home',
            element: <h1>home</h1>,
            guards: [() => {}],
            fallback: <div>loading...</div>,
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
    })

    describe('when a guard has called the `next()` function', () => {
      it('should render the route element after 2000ms', async () => {
        const promiseHandler = createPromiseHandler()
        await TestRenderer.act(async () => {
          const routes: GuardedRouteObject[] = [
            {
              path: 'home',
              element: <h1>home</h1>,
              fallback: <div>loading...</div>,
              guards: [
                (from, to, next) => {
                  setTimeout(() => {
                    next()
                    promiseHandler.call()
                  }, 2000)
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
          expect(renderer.toJSON()).toMatchInlineSnapshot(`
            <div>
              loading...
            </div>
          `)
          jest.runAllTimers()
          // await a micro task
          await promiseHandler.promise
          expect(renderer.toJSON()).toMatchInlineSnapshot(`
            <h1>
              home
            </h1>
          `)
        })
      })
    })
  })
})
