import { ApiFetch } from '../'
import actionTypes from './action-types'

export class ApiResource extends ApiFetch { }

export const invalidateResource = (id) => ({
  type: actionTypes.INVALIDATED, payload: { action: id },
})


