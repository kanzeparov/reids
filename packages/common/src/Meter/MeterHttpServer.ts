import {
  IMeter,
  IMeterConfiguration,
  IMeterConfigurationHTTPServer,
  IMeterValue
} from '@onder/interfaces'
import MeterTransportServer from './MeterTransportServer'
import AddressService from '../AddressService'
import Logger from '../Logger'
import MeterTransport from './MeterTransport'
import { TypedEventEmitter } from '@elderapo/typed-event-emitter'

const log = new Logger('meter-http-server')

class MeterHttpServer extends TypedEventEmitter<MeterHttpServer.Events> implements IMeter {
  readonly configuration: IMeterConfigurationHTTPServer
  private readonly workTimeout: number
  private readonly transport: MeterTransportServer

  constructor (workTimeout: number, proxy: string | undefined, addressService: AddressService, meterConfiguration: IMeterConfigurationHTTPServer) {
    super()
    this.configuration = meterConfiguration
    this.workTimeout = workTimeout
    this.transport = new MeterTransportServer(workTimeout, proxy, meterConfiguration, addressService)
  }

  start (): void {
    this.transport.on(MeterTransport.Event.METER_VALUE, async payload => {
      await this.handleMeterValue(payload.configuration, payload.values)
    })
    this.transport.start()
  }

  stop (): void {
    this.transport.stop()
  }

  async handleMeterValue (configuration: IMeterConfiguration, values: IMeterValue[]): Promise<void> {
    log.debug('Got new values', JSON.stringify(values))
    values.forEach(v => {
      this.emit(MeterHttpServer.Event.METER_VALUE, v)
    })
  }

  currentValue (): Promise<IMeterValue> {
    throw new Error('FIXME MeterHttpServer::currentValue does not make sense')
  }
}

namespace MeterHttpServer {
  export enum Event {
    METER_VALUE
  }

  export type Events = {
    [Event.METER_VALUE]: IMeterValue
  }
}

export default MeterHttpServer
