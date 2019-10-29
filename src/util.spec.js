import * as util from './util'

describe('joinPath', () => {
  it('joins paths', () => {
    const actual = util.joinPath('foo/', 'bar', '/baz')
    expect(actual).toBe('foo/bar/baz')
  })
  it('removes double slashes between 2 joint strings', () => {
    const actual = util.joinPath('http://localhost:1234', '/session/host.html')
    expect(actual).toBe('http://localhost:1234/session/host.html')
  })

  it('removes double slashes between 3 joint strings', () => {
    const actual = util.joinPath('/foo/', '/bar/', '/baz/')
    expect(actual).toBe('/foo/bar/baz/')
  })
})

