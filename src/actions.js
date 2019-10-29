export class ApiFetch {
  constructor(url, init, options = {/* success, fail, validate, meta? */}) {
    this.url = url
    this.init = init
    this.options = options
  }

  static of(...args) {
    return new this(...args)
  }

  static get(url, init, options) {
    return this.of(url, { ...init, method: 'GET' }, options)
  }

  static post(url, init, options) {
    return this.of(url, { ...init, method: 'POST' }, options)
  }

  static put(url, init, options) {
    return this.of(url, { ...init, method: 'PUT' }, options)
  }

  static patch(url, init, options) {
    return this.of(url, { ...init, method: 'PATCH' }, options)
  }

  static delete(url, init, options) {
    return this.of(url, { ...init, method: 'DELETE' }, options)
  }
}


