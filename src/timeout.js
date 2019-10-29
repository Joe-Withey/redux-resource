export class HttpTimeoutError extends Error {
  name = 'HttpTimeoutError'
}

export function httpTimeout(ms) {
  return new Promise((resolve, reject) => setTimeout(() => reject(new HttpTimeoutError()), ms))
}

