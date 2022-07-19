import { MemoryRouter } from 'react-router'
import type { ReactTestRenderer } from 'react-test-renderer'
import TestRenderer from 'react-test-renderer'
import { GuardConfigProvider, GuardedRoute, GuardedRoutes } from '../src'
import { createPromiseHandler } from './utils'

beforeAll(() => {
  jest.useFakeTimers()
})

afterAll(() => {
  jest.useRealTimers()
})

describe('A <GuardedRoute />', () => {
  it('renders its `element` prop', () => {
    let renderer!: ReactTestRenderer
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MemoryRouter initialEntries={['/home']}>
          <GuardConfigProvider>
            <GuardedRoutes>
              <GuardedRoute path="home" element={<h1>Home</h1>} />
            </GuardedRoutes>
          </GuardConfigProvider>
        </MemoryRouter>
      )
    })

    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <h1>
        Home
      </h1>
    `)
  })

  it('renders its child routes when no `element` prop is given', () => {
    let renderer!: ReactTestRenderer
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MemoryRouter initialEntries={['/app/home']}>
          <GuardConfigProvider>
            <GuardedRoutes>
              <GuardedRoute path="app">
                <GuardedRoute path="home" element={<h1>Home</h1>} />
              </GuardedRoute>
            </GuardedRoutes>
          </GuardConfigProvider>
        </MemoryRouter>
      )
    })

    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <h1>
        Home
      </h1>
    `)
  })

  it('render its fallback element when guard middleware is given', async () => {
    await TestRenderer.act(async () => {
      const promiseHandler = createPromiseHandler()
      let renderer!: ReactTestRenderer
      await TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/home']}>
            <GuardConfigProvider>
              <GuardedRoutes>
                <GuardedRoute
                  path="home"
                  element={<h1>Home</h1>}
                  fallback={<div>loading...</div>}
                  guards={[
                    (to, from, next) => {
                      setTimeout(() => {
                        next()
                        promiseHandler.call()
                      }, 2000)
                    },
                  ]}
                />
              </GuardedRoutes>
            </GuardConfigProvider>
          </MemoryRouter>
        )
      })
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div>
        loading...
      </div>
    `)
      jest.runAllTimers()
      await promiseHandler.promise
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            Home
          </h1>
      `)
    })
  })
})
