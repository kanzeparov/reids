import { setInterval, clearInterval } from 'timers'
import { IMeter } from '@onder/interfaces'
import { TypedEventEmitter } from '@elderapo/typed-event-emitter'
import Logger from '../Logger'
import IMeterReader from './IMeterReader'

const log = new Logger('meter-reader')

export default class MeterReader extends TypedEventEmitter<IMeterReader.Events> implements IMeterReader {
  readonly meter: IMeter

  private readonly workTimeout: number
  private timer?: NodeJS.Timer

  constructor (meter: IMeter, workTimeout: number) {
    super()
    this.meter = meter
    this.workTimeout = workTimeout
  }

  async _read (): Promise<void> {
    const value = await this.meter.currentValue()
    log.debug('Reading from meter %o', this.meter.configuration)
    log.debug('Read value %o', value)
    this.emit(IMeterReader.Event.Read, { meter: this.meter, value: value })
  }

  start (): void {
    this.timer = setInterval(this._read.bind(this), this.workTimeout)
  }

  stop (): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = undefined
    }
  }
}
