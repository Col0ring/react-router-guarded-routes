import { MemoryRouter } from 'react-router'
import TestRenderer from 'react-test-renderer'
import {
  GuardConfigProvider,
  GuardedRoute,
  GuardedRouteProps,
  GuardedRoutes,
  GuardProvider,
} from '../src'

describe('<GuardedRoutes />', () => {
  let consoleWarn: jest.SpyInstance
  let consoleError: jest.SpyInstance

  beforeEach(() => {
    consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleWarn.mockRestore()
    consoleError.mockRestore()
  })

  it('renders with non-element children', () => {
    let renderer!: TestRenderer.ReactTestRenderer
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MemoryRouter initialEntries={['/']}>
          <GuardConfigProvider>
            <GuardedRoutes>
              <GuardedRoute path="/" element={<h1>Home</h1>} />
              {false}
              {undefined}
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

  it('renders with React.Fragment children', () => {
    let renderer!: TestRenderer.ReactTestRenderer
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MemoryRouter initialEntries={['/admin']}>
          <GuardConfigProvider>
            <GuardedRoutes>
              <GuardedRoute path="/" element={<h1>Home</h1>} />
              <>
                <GuardedRoute path="admin" element={<h1>Admin</h1>} />
              </>
            </GuardedRoutes>
          </GuardConfigProvider>
        </MemoryRouter>
      )
    })

    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <h1>
        Admin
      </h1>
    `)
  })

  it('renders with <GuardProvider /> children', () => {
    let renderer!: TestRenderer.ReactTestRenderer
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MemoryRouter initialEntries={['/admin']}>
          <GuardConfigProvider>
            <GuardedRoutes>
              <GuardedRoute path="/" element={<h1>Home</h1>} />
              <GuardProvider>
                <GuardedRoute path="admin" element={<h1>Admin</h1>} />
              </GuardProvider>
            </GuardedRoutes>
          </GuardConfigProvider>
        </MemoryRouter>
      )
    })

    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <h1>
        Admin
      </h1>
    `)
  })

  it('throws if some <CustomRoute /> is passed as a child of <Routes>', () => {
    const CustomRoute = (props: GuardedRouteProps) => (
      <GuardedRoute {...props} />
    )

    expect(() => {
      TestRenderer.create(
        <MemoryRouter initialEntries={['/admin']}>
          <GuardConfigProvider>
            <GuardedRoutes>
              <GuardedRoute path="/" element={<h1>Home</h1>} />
              <CustomRoute path="admin" element={<h1>Admin</h1>} />
            </GuardedRoutes>
          </GuardConfigProvider>
        </MemoryRouter>
      )
    }).toThrow(/children of <GuardedRoutes> must be a <GuardedRoute>/)

    expect(consoleError).toHaveBeenCalledTimes(1)
  })

  it('throws if a regular element (ex: <div>) is passed as a child of <Routes>', () => {
    expect(() => {
      TestRenderer.create(
        <MemoryRouter initialEntries={['/admin']}>
          <GuardConfigProvider>
            <GuardedRoutes>
              <GuardedRoute path="/" element={<h1>Home</h1>} />
              <div {...({ path: 'admin', element: <h1>Admin</h1> } as any)} />
            </GuardedRoutes>
          </GuardConfigProvider>
        </MemoryRouter>
      )
    }).toThrow(/children of <GuardedRoutes> must be a <GuardedRoute>/)

    expect(consoleError).toHaveBeenCalledTimes(1)
  })

  it('throws if it has not been rendered in <GuardConfigProvider />', () => {
    expect(() => {
      TestRenderer.create(
        <MemoryRouter initialEntries={['/']}>
          <GuardedRoutes>
            <GuardedRoute path="/" element={<h1>Home</h1>} />
          </GuardedRoutes>
        </MemoryRouter>
      )
    }).toThrow(/<GuardedRoutes> outside a <GuardConfigProvider>./)

    expect(consoleError).toHaveBeenCalledTimes(1)
  })
})
