import { TypedEventEmitter } from '@elderapo/typed-event-emitter'
import Logger from '../Logger'
import IMeterReader from './IMeterReader'
import MeterHttpServer from './MeterHttpServer'
import { IMeterValue } from '@onder/interfaces'

const log = new Logger('meter-reader')

export default class MeterHttpReader extends TypedEventEmitter<IMeterReader.Events> implements IMeterReader {
  readonly meter: MeterHttpServer

  private readonly workTimeout: number

  constructor (meter: MeterHttpServer, workTimeout: number) {
    super()
    this.meter = meter
    this.workTimeout = workTimeout
    this.meter.on(MeterHttpServer.Event.METER_VALUE, async value => {
      await this._read(value)
    })
  }

  async _read (value: IMeterValue): Promise<void> {
    log.debug('Reading from meter %o', this.meter.configuration)
    log.debug('Read value %o', value)
    this.emit(IMeterReader.Event.Read, { meter: this.meter, value: value })
  }

  start (): void {
    this.meter.start()
  }

  stop (): void {
    this.meter.stop()
  }
}
