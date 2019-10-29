import Cookies from 'js-cookie'

export function joinPath(...parts) {
  const leadingSlash = /^\//
  const trailingSlash = /\/$/

  const first = parts.shift()
  const last = parts.pop()
  const middle = parts.map(s => s.replace(leadingSlash, '').replace(trailingSlash, '')).join('/')

  return first.replace(trailingSlash, '')
    .concat('/')
    .concat(middle)
    .concat(middle.length ? '/' : '')
    .concat(last.replace(leadingSlash, ''))
}

export const withCsrf = (csrfKey, init) => csrfKey ? ({
  ...init,
  headers: {
    ...init.headers,
    [csrfKey]: Cookies.get(csrfKey),
  },
}) : init

