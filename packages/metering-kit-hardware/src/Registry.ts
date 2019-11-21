import { ResolveType } from '@onder/interfaces'
import Application from './Application'
import HardwareDatabase from './HardwareDatabase'
import WebService from './WebService'
import { memoize } from 'decko'
import WifiPointService from './WifiPointService'
import { OperatorTransportFactory, AddressService, MeterFactory, MeterTransportClientFactory } from '@onder/common'
import IOptions from './config/IOptions'

export default class Registry {
  readonly configuration: IOptions

  constructor (configuration: IOptions) {
    this.configuration = configuration
  }

  @memoize
  async application (): Promise<Application> {
    const webService = await this.webService()
    const hardwareDatabase = await this.hardwareDatabase()
    const workTimeout = this.configuration.quantum
    const meterConfigurations = this.configuration.meters
    const meterFactory = await this.meterFactory()
    const clientFactory = await this.meterTransportClientFactory()
    const wifi = await this.wifiPointService()
    return new Application(workTimeout, meterFactory, clientFactory, meterConfigurations, webService, hardwareDatabase, wifi)
  }

  @memoize
  async meterFactory (): Promise<MeterFactory> {
    const quantum = this.configuration.quantum
    const proxy = this.configuration.proxy
    const addressService = await this.addressService()
    return new MeterFactory(quantum, proxy, addressService)
  }

  @memoize
  async meterTransportClientFactory (): Promise<MeterTransportClientFactory> {
    const quantum = this.configuration.quantum
    const proxy = this.configuration.proxy
    const addressService = await this.addressService()
    return new MeterTransportClientFactory(quantum, proxy, addressService)
  }

  @memoize
  async hardwareDatabase (): Promise<HardwareDatabase> {
    const dataabseUrl = this.configuration.databaseUrl
    return new HardwareDatabase(dataabseUrl)
  }

  @memoize
  async webService (): Promise<WebService> {
    const port = this.configuration.webInterfacePort
    const host = this.configuration.webInterfaceHost
    return new WebService(port, host)
  }

  @memoize
  async wifiPointService (): Promise<WifiPointService> {
    const meterConfiguration = this.configuration.meters
    return new WifiPointService(meterConfiguration)
  }

  @memoize
  async addressService (): Promise<AddressService> {
    const resolveType = ResolveType.select(this.configuration.resolver.kind)
    const domainName = this.configuration.resolver.domain
    return new AddressService(resolveType, domainName)
  }

  @memoize
  async operatorTransportFactory (): Promise<OperatorTransportFactory> {
    return new OperatorTransportFactory()
  }
}
