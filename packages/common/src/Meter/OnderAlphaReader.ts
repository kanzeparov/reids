import { IMeterConfigurationOnderAlpha, IMeterValue } from '@onder/interfaces'
import IMeterReader from './IMeterReader'
import { TypedEventEmitter } from '@elderapo/typed-event-emitter'
import { MeterOnderAlphaChild, OnderAlphaMeter } from '../meters/OnderAlphaMeter'
import { clearInterval, setInterval } from 'timers'
import Logger from '../Logger'

const log = new Logger('onder-alpha-reader')

class OnderAlphaReader extends TypedEventEmitter<OnderAlphaReader.Events> {
  readonly meter: OnderAlphaMeter

  private readonly workTimeout: number

  private timer?: NodeJS.Timer

  constructor (meter: OnderAlphaMeter, workTimeout: number) {
    super()
    this.meter = meter
    this.workTimeout = workTimeout
  }

  async _read (): Promise<void> {
    const values = await this.meter.currentValue()
    this.emit(OnderAlphaReader.Event.Read, values)
  }

  start (): void {
    if (!this.timer) {
      this.timer = setInterval(this._read.bind(this), this.workTimeout)
    }
  }

  stop (): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = undefined
    }
  }

}

namespace OnderAlphaReader {
  export enum Event {
    Read
  }

  export type Events = {
    [Event.Read]: Array<IMeterValue>
  }

  export class Subreader extends TypedEventEmitter<IMeterReader.Events> implements IMeterReader {
    readonly meter: MeterOnderAlphaChild
    private readonly parent: OnderAlphaReader

    constructor (meter: MeterOnderAlphaChild, parent: OnderAlphaReader) {
      super()
      this.parent = parent
      this.meter = meter

      let index = meter.configuration.index
      this.parent.on(Event.Read, values => {
        let value = values[index]
        log.debug('Reading from meter %o', this.meter.configuration)
        log.debug('Read value %o', value)
        this.emit(IMeterReader.Event.Read, { meter , value })
      })
    }

    start (): void {
      this.parent.start()
    }

    stop (): void {
      this.parent.stop()
    }
  }

  type Port = string
  let baseMeters: Map<Port, OnderAlphaMeter> = new Map()
  let baseReaders: Map<Port, OnderAlphaReader> = new Map()

  export function build (workTimeout: number, configuration: IMeterConfigurationOnderAlpha): IMeterReader {
    let port = configuration.port

    let parentMeter = baseMeters.get(port)
    if (!parentMeter) {
      parentMeter = new OnderAlphaMeter(workTimeout, configuration)
      baseMeters.set(port, parentMeter)
    }
    let meter = new MeterOnderAlphaChild(parentMeter, configuration)

    let parentReader = baseReaders.get(port)
    if (!parentReader) {
      parentReader = new OnderAlphaReader(parentMeter, workTimeout)
      baseReaders.set(port, parentReader)
    }

    return new Subreader(meter, parentReader)
  }
}

export default OnderAlphaReader
