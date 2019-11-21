import Logger from '../../Logger'

const log = new Logger('time-cache')

export class TimeCache<A> {
  private cached: A | undefined
  private previously?: number
  readonly ttl: number

  constructor (ttl: number) {
    this.ttl = ttl * 1000
  }

  use (f: () => A): A {
    if (this.isStale()) {
      this.cached = f()
      this.previously = Date.now()
    } else {
      log.info('Using cached value')
    }
    return this.cached!
  }

  isStale (): boolean {
    let now = Date.now()
    return !this.previously || this.previously + this.ttl < now
  }
}
