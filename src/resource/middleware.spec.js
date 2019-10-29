import { createStore as createReduxStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { identity } from 'ramda'
import { middleware, ApiResource, selectResource, withApiResourceReducer } from './'

jest.mock('js-cookie', () => ({
  __esModule: true, // required for mocking default exports
  default: { get: jest.fn(_ => 'COOKIE') },
}))

jest.mock('../fetch', () => ({
  __esModule: true, // required for mocking default exports
  default: jest.fn((url, init) => {
    const response  = { ...init, json: () => 'json' }
    return init.ok ? Promise.resolve(response) : Promise.reject(response)
  })
}))

function restOfStore(state = { x: 0 }, action) {
  if (action.type === 'INC_X') {
    return { ...state, x: state.x + 1 }
  }

  return state
}

const id = 'user_details'

const suppliedConfig = {
  baseURL: 'http://localhost:8081',
  actions: {
    request: jest.fn(_ => identity),
    response: jest.fn(_ => identity),
    error: jest.fn(_ => identity),
    unhandledError: jest.fn(_ => identity),
  },
}

const createStore = (middleware) => createReduxStore(
  combineReducers(withApiResourceReducer({ restOfStore })),
  {},
  applyMiddleware(
    thunk,
    middleware
  )
)

describe('redux-api/resource/middleware', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('dispatches the correct actions when successful', async () => {
    const store = createStore(middleware(suppliedConfig))

    const result = store.dispatch(ApiResource.get(
      '/api/user/details',
      { ok: true },
      { id }
    ))

    const pendingResource = selectResource(id, store.getState())

    expect(pendingResource).toEqual({
      model: null,
      error: null,
      meta: {
        isLoading: true,
        isLoaded: false,
        hasError: false,
        isInvalidated: false,
      }
    })

    await result

    expect(suppliedConfig.actions.request).toHaveBeenCalledTimes(1)
    expect(suppliedConfig.actions.response).toHaveBeenCalledTimes(1)
    expect(suppliedConfig.actions.error).toHaveBeenCalledTimes(0)
    expect(suppliedConfig.actions.unhandledError).toHaveBeenCalledTimes(0)

    const loadedResource = selectResource(id, store.getState())

    expect(loadedResource).toEqual({
      model: 'json',
      error: null,
      meta: {
        isLoading: false,
        isLoaded: true,
        isInvalidated: false,
        hasError: false,
      }
    })
  })

  it('dispatches the correct actions when it fails with a handled error', async () => {
    const store = createStore(middleware(suppliedConfig))

    try {
      await store.dispatch(ApiResource.get(
        '/api/user/details',
        { ok: false },
        { id, fail: error => Promise.resolve(error) }
      ))
    } catch (error) {
      expect(suppliedConfig.actions.request).toHaveBeenCalledTimes(1)
      expect(suppliedConfig.actions.response).toHaveBeenCalledTimes(0)
      expect(suppliedConfig.actions.error).toHaveBeenCalledTimes(1)
      expect(suppliedConfig.actions.unhandledError).toHaveBeenCalledTimes(0)

      const loadedResource = selectResource(id, store.getState())

      expect(loadedResource).toEqual({
        model: null,
        error: 'json',
        meta: {
          isLoading: false,
          isLoaded: false,
          isInvalidated: false,
          hasError: true,
        }
      })
    }
  })

  it('dispatches the correct actions when it fails with an unhandled error', async () => {
    const store = createStore(middleware(suppliedConfig))

    try {
      await store.dispatch(ApiResource.get(
        '/api/user/details',
        { ok: false },
        { id }
      ))
    } catch (error) {
      expect(suppliedConfig.actions.request).toHaveBeenCalledTimes(1)
      expect(suppliedConfig.actions.response).toHaveBeenCalledTimes(0)
      expect(suppliedConfig.actions.error).toHaveBeenCalledTimes(1)
      expect(suppliedConfig.actions.unhandledError).toHaveBeenCalledTimes(1)

      const loadedResource = selectResource(id, store.getState())

      expect(loadedResource).toEqual({
        model: null,
        error: 'json',
        meta: {
          isLoading: false,
          isLoaded: false,
          isInvalidated: false,
          hasError: true,
        }
      })
    }
  })
})


