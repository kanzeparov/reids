import { setInterval, clearInterval } from 'timers'

type Fn = () => Promise<void>

namespace Timely {
  export class Singlet {
    private readonly period: number
    private readonly fn: Fn

    private timer: NodeJS.Timer | undefined = undefined
    private busy: boolean = false

    constructor (period: number, fn: Fn) {
      this.period = period
      this.fn = fn
    }

    start () {
      if (this.timer) return

      this.timer = setInterval(async () => {
        if (this.busy) return
        try {
          await this.fn()
        } finally {
          this.busy = false
        }
      }, this.period)
    }

    stop () {
      if (this.timer) clearInterval(this.timer)
    }
  }
}

export default Timely
