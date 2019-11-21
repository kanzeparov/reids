import { TimeCache } from './TimeCache'

describe('constructor', () => {
  test('set ttl in millis' , () => {
    const ttl = 100 // seconds
    const cache = new TimeCache(ttl)
    expect(cache.ttl).toBe(ttl * 1000)
  })
})

describe('#isStale', () => {
  test('true when start' , () => {
    const ttl = 100 // seconds
    const cache = new TimeCache(ttl)
    expect(cache.isStale()).toBeTruthy()
  })

  test('execute if is stale' , () => {
    const ttl = 0.5 // seconds
    const cache = new TimeCache(ttl)
    expect(cache.isStale()).toBeTruthy()
    cache.use(() => {
      setTimeout(() => {
        expect(cache.isStale()).toBeTruthy()
      }, 0.7)
      return 3
    })
    expect(cache.isStale()).toBeFalsy()
  })

  test('return cached if not stale' , () => {
    const ttl = 10 // seconds
    const cache = new TimeCache(ttl)
    expect(cache.isStale()).toBeTruthy()
    const a = cache.use(() => 3)
    expect(cache.isStale()).toBeFalsy()
    expect(a).toBe(3)
    const b = cache.use(() => 5)
    expect(b).toBe(a)
  })
})
