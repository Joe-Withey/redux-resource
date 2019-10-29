import { pipe, contains, flip, prop, unless } from 'ramda'

const isContainedIn = flip(contains)

export const isOk = prop('ok')

export const resolveStatusCodes = (statusList) => pipe(
  prop('status'),
  isContainedIn(statusList)
)


