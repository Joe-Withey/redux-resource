import { mergeDeepLeft } from 'ramda'
import namespace from './namespace'
import actionTypes from './action-types'

const initialState = {}

export function withApiResourceReducer(reducersObject) {
  return { ...reducersObject, [namespace]: reducer }
}

function reducer(state = initialState, { type, payload = {} }) {
  if (!type || !type.startsWith(namespace)) {
    return state
  }

  const { action, error, response } = payload
  const { id } = action.options

  switch (type) {
    case actionTypes.FAILED:
      return mergeDeepLeft({
        [id]: {
          model: null,
          error,
          meta: {
            hasError: true,
            isLoaded: false,
            isInvalidated: false,
            isLoading: false,
          },
        },
      }, state)
    case actionTypes.FULLFILLED:
      return {
        ...state,
        [id]: {
          model: response,
          error: null,
          meta: {
            hasError: false,
            isLoaded: true,
            isInvalidated: false,
            isLoading: false,
          },
        },
      }
    case actionTypes.INVALIDATED:
      return mergeDeepLeft({
        [id]: {
          meta: {
            isInvalidated: true,
          },
        },
      }, state)
    case actionTypes.PENDING:
      return {
        ...state,
        [id]: {
          model: null,
          error: null,
          meta: {
            hasError: false,
            isLoaded: false,
            isLoading: true,
            isInvalidated: false,
          },
        },
      }
    default:
      return state
  }
}

