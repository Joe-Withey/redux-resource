# API middleware

## Usage

### Init

```
import { middleware as api } from 'redux-api'

const apiConfig = {
  baseURL: 'http://localhost:8081',
  timeout: 30000,
  csrfKey: 'X-CSRF',
  adapters: {
    request: ([path, config], action) => [path, config],
    response: (response, action) => response,
  },
  actions: {
    request: (req) => (dispatch, getState) => dispatch({ type: 'API_REQUEST' }),
    response: (res) => (dispatch, getState) => dispatch({ type: 'API_RESPONSE' }),
    error: (err) => (dispatch, getState) => dispatch({ type: 'API_ERROR' }),
    unhandledError: (err) => (dispatch, getState) => dispatch({ type: 'API_UNHANDLED_ERROR' }),,
  },
  defaults: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  }
}

const store = createStore(
  reducers,
  initialState,
  applyMiddleware(api(apiConfig))
)
```

### ApiFetch

Dispatch ApiFetch actions for low level control and custom state handlers.

It should be noted that the arguments for an ApiFetch or ApiResource are the same as for `window.fetch`, plus and extra arg for the redux-api library.

```
import { ApiFetch } from 'redux-api'

export function getUserDetails(id) {
  return dispatch => {
    const apiCall = ApiFetch.get(
      `/user/details/${id}`,
      {},
      { 
        validate: prop('ok'), // Validate responses, return true for a success and false for a fail
        success: (payload) => dispatch({ type: 'USER_DETAILS_SUCCESS', payload }),
        fail: (payload) => dispatch({ type: 'USER_DETAILS_FAIL', payload }),
      }
    )

    return dispatch(apiCall) // The return value is a Promise
  }
}
```

### ApiResource

Dispatch ApiResource actions for standardised state handlers on api calls and remove boilerplate from redux modules.

#### Create the store
```
import { applyMiddleware, combineReducers, createStore } from 'redux'
import { middleware as api, withApiResourceReducer } from 'redux-api/resource'

const store = createStore(
  combineReducers(withApiResourceReducer(reducers)),
  initialState,
  applyMiddleware(api(apiConfig))
)
```

#### Dispatch resource actions

ApiResource's are assigned an ID for reference and will populate the store at the pending, success, fail and invalidated states of the API call.

```
import { HttpTimeoutError } from 'redux-api'
import { ApiResource, selectResource, HttpTimeoutError } from 'redux-api/resource'

const userDetailsResource = 'user_details'

export function getUserDetails(id) {
  return dispatch => {
    const apiCall = ApiResource.get(
      `/user/details/${id}`,
      {},
      {
        validate: res => [200, 201].includes(res.status),
        id: userDetailsResource,
        // Attach a fail handler and resolve expected errors to avoid triggering the "unhandledErrorHandler"
        fail: error => error instanceOf HttpTimeoutError ? Promise.resolve(error) : Promise.reject(error)
      }
    )

    return dispatch(apiCall) // The return value is a Promise
  }
}
```

#### Connect to the resource

Select a resource from the store by using it's ID.

```
import { selectResource } from 'redux-api/resource'

const mapStateToProps = state => {
  const userDetails selectResource(userDetailsResource, state),
  
  const {
    model,
    error,
    meta: {
      isLoading,
      isLoaded,
      hasError,
      isInvalidated,
    }
  } = userDetails

  return { userDetails }
}
```

#### Invalidate (cancel) a resource
```
import { invalidateResource } from 'redux-api/resource'

const userDetailsResource = 'user_details'

dispatch(invalidateResource(userDetailsResource))
```

### Notes

redux-api tries to be really close to fetch so it doesn't stringify your json or call json on responses, you'll have to do that yourself each time or use some adapters in the middleware config such as:

```
const apiConfig = {
  adapters: {
    request: ([url, init], action) => [url, { ...init, body: JSON.stringify(init.body) }],
    response: (response, action) => response.json(),
  },
```

