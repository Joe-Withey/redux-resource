import { curry, path } from 'ramda'
import namespace from './namespace'

const initialResourceState = {
  model: null,
  error: null,
  meta: {
    isLoaded: false,
    isLoading: false,
    hasError: false,
    isInvalidated: false,
  }
}

export const select = curry((id, state) => {
  return path([namespace, id], state) || initialResourceState
})

