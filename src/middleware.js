import { identity, mergeDeepRight, T } from 'ramda'
import { joinPath, withCsrf } from './util'
import { httpTimeout } from './timeout'
import { ApiFetch } from './actions'
import fetch from './fetch'

export const defaultConfig = {
  baseURL: '',
  timeout: 30000,
  csrfKey: '',
  adapters: {
    request: ([url, init], action) => [url, init],
    response: (response, action) => response,
  },
  actions: {
    request: (/* action */) => identity,
    response: (/* response, action */) => identity,
    error: (/* error, action */) => identity,
    unhandledError: (/* error, action */) => identity,
  },
  defaultValidator: T,
  defaults: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  },
}

export function middleware(suppliedConfig = {}) {
  const config = mergeDeepRight(defaultConfig, suppliedConfig)

  return store => next => action => {
    if (action instanceof ApiFetch) {
      const {
        validate = config.defaultValidator,
        success = identity,
        fail = error => { throw error },
      } = action.options

      store.dispatch(config.actions.request(action))

      const { url, init } = action

      const requestArgs = config.adapters.request([
        joinPath(config.baseURL, url),
        withCsrf(config.csrfKey, mergeDeepRight(config.defaults, init)),
      ], action)

      const request = fetch(...requestArgs)

      const promises = (config.timeout)
        ? [request, httpTimeout(config.timeout)]
        : [request]

      const handleResponse = async (response) => {
        const responseAction = config.actions.response(response, action)
        store.dispatch(responseAction)

        const adaptedResponse = await config.adapters.response(response, action)

        return success(adaptedResponse)
      }

      const handleError = async (error) => {
        const errorAction = config.actions.error(error, action)
        store.dispatch(errorAction)

        try {
          return fail(error)
        } catch (unhandledError) {
          const unhandledErrorAction = config.actions.unhandledError(unhandledError, action)
          store.dispatch(unhandledErrorAction)
          return Promise.reject(unhandledError)
        }
      }

      return Promise.race(promises)
        .then((response) => validate(response) ? response : Promise.reject(response))
        .then(handleResponse)
        .catch(handleError)
    } 

    return next(action)
  }
}

