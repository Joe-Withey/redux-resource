import { middleware as api, ApiFetch } from '../../src'
import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'

const apiConfig = {
  baseURL: 'https://jsonplaceholder.typicode.com/todos',
  timeout: 30000,
  adapters: {
    request: ([path, config], action) => [path, config],
    response: (response, action) => response,
  },
  actions: {
    request: (req, action) => (dispatch, getState) => dispatch({ type: 'API_REQUEST' }),
    response: (res, action) => (dispatch, getState) => dispatch({ type: 'API_RESPONSE' }),
    error: (err, action) => (dispatch, getState) => dispatch({ type: 'API_ERROR' }),
    unhandledError: (err, action) => (dispatch, getState) => dispatch({ type: 'API_UNHANDLED_ERROR' }),
  },
  defaults: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  }
}

const enhancers = [
  applyMiddleware(
    thunk,
    api(apiConfig),
  ),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
]

const reducer = x => x

const store = createStore(
  reducer,
  compose.apply(null, enhancers.filter(Boolean)),
)

store.dispatch(dispatch => {
  const apiCall = ApiFetch.get(
    '/1',
    {},
    { 
      validate: request => request.ok, // Validate responses, return true for a success and false for a fail
      success: (payload) => {
        dispatch({ type: 'TODO_SUCCESS', payload })
      },
      fail: (payload) => {
        dispatch({ type: 'TODO_FAIL', payload })
      },
    }
  )

  return dispatch(apiCall) // The return value is a Promise
})
