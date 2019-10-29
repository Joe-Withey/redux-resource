import { ApiFetch } from './actions'
import { tap } from 'ramda'

const action = (type, payload = null) => ({ type, payload })

describe('redux-api/middleware', () => {
  let middleware

  const store = { dispatch: jest.fn() }
  const next = jest.fn(a => ['NEXT', a])

  jest.mock('js-cookie', () => ({
    __esModule: true, // required for mocking default exports
    default: {
      get: jest.fn(_ => 'COOKIE'),
    },
  }))

  jest.doMock('./fetch', () => ({
    __esModule: true, // required for mocking default exports
    default: jest.fn((url, init) => init.ok ? Promise.resolve([url, init]) : Promise.reject([url, init])),
  }))

  describe('middleware', () => {
    beforeEach(() => {
      middleware = require('./middleware').middleware // eslint-disable-line global-require
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('does call next given other action', () => {
      const OTHER = 'OTHER'
      const result = middleware()(store)(next)(action(OTHER))

      expect(result).toEqual(next(action(OTHER)))
    })

    it('dispatches the correct actions when successful', async () => {
      expect.assertions(7)

      const suppliedConfig = {
        baseURL: 'http://localhost:8081',
        csrfKey: 'foo',
        actions: {
          request: jest.fn(),
          response: jest.fn(),
          error: jest.fn(),
          unhandledError: jest.fn(),
        },
      }

      const dispatch = middleware(suppliedConfig)(store)(next)
      const resolvers = { success: jest.fn(x => x) }

      const result = await dispatch(ApiFetch.of('/api/user/details', { ok: true }, resolvers))

      expect(result[0]).toBe('http://localhost:8081/api/user/details')
      expect(result[1].headers.foo).toBe('COOKIE')
      expect(resolvers.success).toHaveBeenCalledTimes(1)
      expect(suppliedConfig.actions.request).toHaveBeenCalledTimes(1)
      expect(suppliedConfig.actions.response).toHaveBeenCalledTimes(1)
      expect(suppliedConfig.actions.error).toHaveBeenCalledTimes(0)
      expect(suppliedConfig.actions.unhandledError).toHaveBeenCalledTimes(0)
    })

    it('dispatches the correct actions when it handling a failure', async () => {
      expect.assertions(4)

      const suppliedConfig = {
        baseURL: 'http://localhost:8081',
        csrfKey: 'foo',
        actions: {
          request: jest.fn(),
          response: jest.fn(),
          error: jest.fn(),
          unhandledError: jest.fn(),
        },
      }

      const dispatch = middleware(suppliedConfig)(store)(next)

      await dispatch(ApiFetch.of('/api/user/details', { ok: false }, { fail: x => x }))

      expect(suppliedConfig.actions.request).toHaveBeenCalledTimes(1)
      expect(suppliedConfig.actions.response).toHaveBeenCalledTimes(0)
      expect(suppliedConfig.actions.error).toHaveBeenCalledTimes(1)
      expect(suppliedConfig.actions.unhandledError).toHaveBeenCalledTimes(0)
    })

    it('dispatches the correct actions when no handler is supplied', async () => {
      expect.assertions(4)

      const suppliedConfig = {
        baseURL: 'http://localhost:8081',
        csrfKey: 'foo',
        actions: {
          request: jest.fn(),
          response: jest.fn(),
          error: jest.fn(),
          unhandledError: jest.fn(),
        },
      }

      const dispatch = middleware(suppliedConfig)(store)(next)

      try {
        await dispatch(ApiFetch.of('/api/user/details', { ok: false }))
      } catch (error) {
        expect(suppliedConfig.actions.request).toHaveBeenCalledTimes(1)
        expect(suppliedConfig.actions.response).toHaveBeenCalledTimes(0)
        expect(suppliedConfig.actions.error).toHaveBeenCalledTimes(1)
        expect(suppliedConfig.actions.unhandledError).toHaveBeenCalledTimes(1)
      }
    })

    it('dispatches the correct actions when fail handler fails', async () => {
      expect.assertions(4)

      const suppliedConfig = {
        baseURL: 'http://localhost:8081',
        csrfKey: 'foo',
        actions: {
          request: jest.fn(),
          response: jest.fn(),
          error: jest.fn(),
          unhandledError: jest.fn(),
        },
      }

      const dispatch = middleware(suppliedConfig)(store)(next)

      try {
        await dispatch(ApiFetch.of('/api/user/details', { ok: false } , { fail: x => { throw x } }))
      } catch (error) {
        expect(suppliedConfig.actions.request).toHaveBeenCalledTimes(1)
        expect(suppliedConfig.actions.response).toHaveBeenCalledTimes(0)
        expect(suppliedConfig.actions.error).toHaveBeenCalledTimes(1)
        expect(suppliedConfig.actions.unhandledError).toHaveBeenCalledTimes(1)
      }
    })

    it('adapts the response', async () => {
      expect.assertions(2)

      const suppliedConfig = {
        baseURL: 'http://localhost:8081',
        csrfKey: 'foo',
        adapters: {
          response: ([url, res]) => [url, { ...res, foo: res.foo + 1 }],
        }
      }

      const dispatch = middleware(suppliedConfig)(store)(next)

      const [_, response] = await dispatch(ApiFetch.of(
        '/api/user/details',
        { ok: true, foo: 1 },
        { success: tap(([_, res]) => expect(res.foo).toBe(2)) }
      ))

      expect(response.foo).toBe(2)
    })

    it('adapts the request', async () => {
      expect.assertions(1)

      const suppliedConfig = {
        baseURL: 'http://localhost:8081',
        csrfKey: 'foo',
        adapters: {
          request: ([url, init]) => ['', init],
        },
      }

      const dispatch = middleware(suppliedConfig)(store)(next)

      const [url, response] = await dispatch(ApiFetch.of(
        '/api/user/details',
        { ok: true },
      ))

      expect(url).toBe('')
    })

    it('validates responses', async () => {
      expect.assertions(1)

      const suppliedConfig = { baseURL: 'http://localhost:8081' }

      const dispatch = middleware(suppliedConfig)(store)(next)

      try {
        await dispatch(ApiFetch.of(
          '/api/user/details',
          { ok: true, foo: true },
          { validate: ([_, res]) => res.foo !== undefined && res.foo !== true }
        ))
      } catch (error) {
        expect(error[1].foo).toBe(true)
      }
    })
  })
})

