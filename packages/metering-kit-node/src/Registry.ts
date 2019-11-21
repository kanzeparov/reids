import { memoize } from 'decko'
import { AddressService, OperatorTransportFactory, MeterFactory } from '@onder/common'
import IOptions from './config/IOptions'
import Application from './Application'
import { ResolveType } from '@onder/interfaces'
import DatabaseFactory from './DatabaseFactory'
import Ethereum from './Ethereum'
import ProblemController from './ProblemController'
import VirtualMeterFactory from './VirtualMeterFactory'
import VirtualMeterContainer from './VirtualMeterContainer'
import WebServer from './WebEndpoints/WebServer'

export default class Registry {
  readonly configuration: IOptions

  constructor (configuration: IOptions) {
    this.configuration = configuration
  }

  @memoize
  async application (): Promise<Application> {
    const quantum = this.configuration.quantum
    const defaultPrice = this.configuration.defaultPrice
    const isSeller = this.configuration.isSeller
    const allowSendStatistic = this.configuration.allowSendStatistic
    const meters = await this.virtualMeterContainer()
    const web = await this.webServer()
    return new Application(quantum, defaultPrice, isSeller, allowSendStatistic, meters, web)
  }

  @memoize
  async webServer (): Promise<WebServer> {
    const quantum = this.configuration.quantum
    const isSeller = this.configuration.isSeller
    const defaultPrice = this.configuration.defaultPrice
    const port = this.configuration.webInterfacePort
    const host = this.configuration.host
    const allowSendStatistic = this.configuration.allowSendStatistic
    const upstreamAccount = this.configuration.upstreamAccount
    const meters = await this.virtualMeterContainer()
    const problemController = await this.problemController()
    return new WebServer(quantum, isSeller, defaultPrice, host, port, allowSendStatistic, meters, upstreamAccount, problemController)
  }

  @memoize
  async virtualMeterContainer (): Promise<VirtualMeterContainer> {
    const meterConfiguration = this.configuration.meters
    const meterFactory = await this.meterFactory()
    const virtualMeterFactory = await this.virtualMeterFactory()
    return VirtualMeterContainer.build(meterConfiguration, meterFactory, virtualMeterFactory)
  }

  @memoize
  async operatorTransportFactory (): Promise<OperatorTransportFactory> {
    return new OperatorTransportFactory()
  }

  @memoize
  async meterFactory (): Promise<MeterFactory> {
    const quantum = this.configuration.quantum
    const proxy = this.configuration.proxy
    const addressService = await this.addressService()
    return new MeterFactory(quantum, proxy, addressService)
  }

  @memoize
  async virtualMeterFactory (): Promise<VirtualMeterFactory> {
    const quantum = this.configuration.quantum
    const upstreamAccount = this.configuration.upstreamAccount
    const ethereum = await this.ethereum()
    const addressService = await this.addressService()
    const databaseFactory = await this.databaseFactory()
    const problemController = await this.problemController()
    const dsmUrl = this.configuration.dsmUrl
    const operatorUrl = this.configuration.operatorUrl
    const tradeHost = this.configuration.tradeHost
    const tradePort = this.configuration.tradePort
    const minimumChannelAmount = this.configuration.minimumChannelAmount
    const tokenContract = this.configuration.tokenContract
    const cellName = this.configuration.cellName
    return new VirtualMeterFactory(quantum, tradeHost, tradePort, ethereum, upstreamAccount, addressService, databaseFactory, problemController, minimumChannelAmount, dsmUrl, tokenContract, operatorUrl, cellName)
  }

  @memoize
  async databaseFactory (): Promise<DatabaseFactory> {
    const config = this.configuration
    const defaultPrice = config.defaultPrice
    const upstreamAccount = config.upstreamAccount
    const databaseConfig = config.databaseConfig
    const databaseUrl = config.databaseUrl
    return new DatabaseFactory(defaultPrice, upstreamAccount, databaseConfig, databaseUrl)
  }

  @memoize
  async problemController (): Promise<ProblemController> {
    const databaseFactory = await this.databaseFactory()
    const meters = this.configuration.meters
    const allowSendStatistic = this.configuration.allowSendStatistic
    const addressService = await this.addressService()
    const operatorTransportFactory = await this.operatorTransportFactory()
    const storeErrors = this.configuration.storeErrors
    return new ProblemController(storeErrors, databaseFactory, meters, allowSendStatistic, addressService, operatorTransportFactory)
  }

  @memoize
  async ethereum (): Promise<Ethereum> {
    const wallets = this.configuration.wallets
    const ethereumUrl = this.configuration.ethereumUrl
    return Ethereum.build(wallets, ethereumUrl)
  }

  @memoize
  async addressService (): Promise<AddressService> {
    const resolveType = ResolveType.select(this.configuration.resolver.kind)
    const domainName = this.configuration.resolver.domain
    return new AddressService(resolveType, domainName)
  }

}
