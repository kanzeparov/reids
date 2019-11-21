import { IHardwareDatabase, IMeterConfiguration } from '@onder/interfaces'
import { MeterFactory, IMeterReader, MeterTransportClientFactory } from '@onder/common'
import MeterSender from './MeterSender'
import WebService from './WebService'
import ZeroReader from './ZeroReader'
import Logger from './Logger'
import WifiPointService from './WifiPointService'

const log = new Logger('application')

export default class Application {
  private readonly quantum: number
  private readonly meterConfiguration: Array<IMeterConfiguration>
  private readonly webService: WebService
  private readonly hardwareDatabase: IHardwareDatabase
  private readonly meterFactory: MeterFactory
  private readonly transportFactory: MeterTransportClientFactory
  private readonly zeroReader: ZeroReader
  private readonly wifi: WifiPointService

  constructor (quantum: number, meterFactory: MeterFactory, transportFactory: MeterTransportClientFactory, meterConfiguraiton: Array<IMeterConfiguration>, webService: WebService, hardwareDatabase: IHardwareDatabase, wifi: WifiPointService) {
    this.meterFactory = meterFactory
    this.transportFactory = transportFactory
    this.quantum = quantum
    this.meterConfiguration = meterConfiguraiton
    this.webService = webService
    this.hardwareDatabase = hardwareDatabase
    this.zeroReader = new ZeroReader()
    this.wifi = wifi
  }

  async run (): Promise<void> {
    log.info('Starting application...')

    this.meterConfiguration.forEach(config => {
      const reader = this.meterFactory.build(config)

      const meterTransportClient = this.transportFactory.build(config)
      const meterSender = new MeterSender(this.quantum, config, meterTransportClient, this.hardwareDatabase)

      reader.on(IMeterReader.Event.Read, async payload => {
        this.zeroReader.setLastValue(payload.value)
        await meterSender.sendValue(payload.meter.configuration.account, payload.value)
      })

      reader.start()
    })

    this.webService.attach('/measurements', this.zeroReader.routes())
    this.webService.attach('/wifi', this.wifi.routes())

    await this.wifi.init()
    this.webService.run()
    log.info('Application started')
  }
}
