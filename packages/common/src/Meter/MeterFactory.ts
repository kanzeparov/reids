import EmulatedMeter from '../meters/EmulatedMeter'
import MeterRandom from '../meters/MeterRandom'
import ZeroMeter from '../meters/ZeroMeter'
import EnergomeraMeter from '../meters/EnergomeraMeter'
import MeterHTTPServer from './MeterHttpServer'
import MeterMQTT from './MeterMqtt'
import { ConnectionKind, IMeterConfiguration } from '@onder/interfaces'
import EnergomeraAsyncMeter from '../meters/EnergomeraAsyncMeter'
import AddressService from '../AddressService'
import MeterReader from './MeterReader'
import OnderAlphaReader from './OnderAlphaReader'
import IMeterReader from './IMeterReader'
import MeterHttpReader from './MeterHttpReader'
import MeterMqttReader from './MeterMqttReader'

export class UnknownMeterError extends Error {
  constructor (meterConfiguration: never) {
    super(`Got unknown meter configuration ${JSON.stringify(meterConfiguration)}`)
  }
}

export default class MeterFactory {
  private readonly workTimeout: number
  private readonly proxy: string | undefined
  private readonly addressService: AddressService

  constructor (workTimeout: number, proxy: string | undefined, addressService: AddressService) {
    this.workTimeout = workTimeout
    this.proxy = proxy
    this.addressService = addressService
  }

  build (meterConfiguration: IMeterConfiguration): IMeterReader {
    switch (meterConfiguration.kind) {
      case ConnectionKind.Zero:
        return new MeterReader(new ZeroMeter(this.workTimeout, meterConfiguration), this.workTimeout)
      case ConnectionKind.Random:
        return new MeterReader(new MeterRandom(this.workTimeout, meterConfiguration), this.workTimeout)
      case ConnectionKind.File:
        return new MeterReader(new EmulatedMeter(this.workTimeout, meterConfiguration), this.workTimeout)
      case ConnectionKind.HTTPServer:
        return new MeterHttpReader(new MeterHTTPServer(this.workTimeout, this.proxy, this.addressService, meterConfiguration), this.workTimeout)
      case ConnectionKind.Energomera:
        return new MeterReader(new EnergomeraMeter(this.workTimeout, meterConfiguration), this.workTimeout)
      case ConnectionKind.EnergomeraAsync:
        return new MeterReader(new EnergomeraAsyncMeter(this.workTimeout, meterConfiguration), this.workTimeout)
      case ConnectionKind.OnderAlpha:
        return OnderAlphaReader.build(this.workTimeout, meterConfiguration)
      case ConnectionKind.MQTT:
        return new MeterMqttReader(new MeterMQTT(meterConfiguration))
      default:
        throw new UnknownMeterError(meterConfiguration)
    }
  }
}
