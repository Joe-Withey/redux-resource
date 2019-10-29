import { curry } from 'ramda'

export const tapThunk = curry((tappingThunk, tappedThunk) => (...args) => dispatch => {
  dispatch(tappingThunk(...args))
  return dispatch(tappedThunk(...args))
})

