import { mergeDeepRight, evolve } from 'ramda'
import { middleware as initialiseApiMiddleware, defaultConfig as baseDefaultConfig } from '../middleware'
import { HttpTimeoutError } from '../timeout'
import { ApiResource } from './actions'
import actionTypes from './action-types'
import { tapThunk } from './util'

const defaultConfig = {
  adapters: baseDefaultConfig.adapters,
  actions: baseDefaultConfig.actions,
}

function handleRequest(action) {
  return async dispatch => {
    if (action instanceof ApiResource) {
      dispatch({
        type: actionTypes.PENDING,
        payload: { action },
      })
    }
  }
}

function handleResponse(res, action) {
  return async dispatch => {
    if (action instanceof ApiResource) {
      const response = await res.json()

      dispatch({
        type: actionTypes.FULLFILLED,
        payload: { response, action },
      })
    }
  }
}

function handleError(err, action) {
  // @todo: need to consider different error types, may be http or may be type error etc
  return async dispatch => {
    if (action instanceof ApiResource) {
      let error

      if (err instanceof window.Response) {
        const body = await err.json()
        error = { type: 'Response', status: err.status, body }
      } else if (err instanceof HttpTimeoutError) {
        error = { type: err.name, body: err.message }
      } else {
        throw err
      }

      dispatch({
        type: actionTypes.FAILED,
        payload: { error, action },
      })
    }
  }
}

export function middleware(suppliedConfig = {}) {
  return store => {
    const config = evolve({
      actions: {
        request: tapThunk(handleRequest),
        response: tapThunk(handleResponse),
        error: tapThunk(handleError),
      },
    }, mergeDeepRight(defaultConfig, suppliedConfig))

    const apiMiddleware = initialiseApiMiddleware(config)

    return apiMiddleware(store)
  }
}

