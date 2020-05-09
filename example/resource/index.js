import { middleware as api, withApiResourceReducer, ApiResource } from '../../src/resource'
import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import thunk from 'redux-thunk'

const apiConfig = {
  baseURL: 'https://jsonplaceholder.typicode.com/todos',
  timeout: 30000,
  defaultValidator: res => res.ok,
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

const reducers = withApiResourceReducer({ reducer: () => {} });

const store = createStore(
  combineReducers(reducers),
  compose.apply(null, enhancers.filter(Boolean)),
)

store.dispatch(dispatch => {
  const apiCall = ApiResource.get('/-101', {}, { id: 'todos' })
  return dispatch(apiCall) // The return value is a Promise
})
