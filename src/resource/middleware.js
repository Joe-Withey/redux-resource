import { mergeDeepRight, evolve } from 'ramda'
import { middleware as initialiseApiMiddleware, defaultConfig as baseDefaultConfig } from '../middleware'
import { ApiResource } from './actions'
import actionTypes from './action-types'
import { tapThunk } from './util'

const defaultConfig = {
  adapters: baseDefaultConfig.adapters,
  actions: baseDefaultConfig.actions,
}

function handleRequest(action) {
  return dispatch => {
    if (action instanceof ApiResource) {
      dispatch({
        type: actionTypes.PENDING,
        payload: { action },
      })
    }
  }
}

function handleResponse(response, action) {
  return dispatch => {
    if (action instanceof ApiResource) {
      dispatch({
        type: actionTypes.FULLFILLED,
        payload: { response: response.json(), action },
      })
    }
  }
}

function handleError(error, action) {
  return dispatch => {
    if (action instanceof ApiResource) {
      dispatch({
        type: actionTypes.FAILED,
        payload: { error: error.json(), action },
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

