import {
  ModuleType, IModule
} from '@onder/interfaces'
import { AddressService, OperatorTransportFactory } from '@onder/common'
import Logger from '@machinomy/logger'
import OperatorTransportCallback from './OperatorTransportCallback'
import OperatorDatabase from './operatorDatabase/OperatorDatabase'
import OperatorConfiguration from './Configuration'

const log = new Logger('onder-operator-application')

class Application implements IModule {
  private readonly configuration: OperatorConfiguration
  private readonly factory: OperatorTransportFactory
  private readonly addressService: AddressService

  private operatorPort = 5000

  constructor (configuration: OperatorConfiguration, factory: OperatorTransportFactory, addressService: AddressService) {
    this.configuration = configuration
    this.factory = factory
    this.addressService = addressService
  }

  async startApplication (): Promise<void> {
    try {
      const operatorDatabase = new OperatorDatabase(this.configuration)
      await operatorDatabase.createTables()
      const operatorTransportCallback = new OperatorTransportCallback(operatorDatabase.requests)

      // FUCK MY BRAIN FIXME TODO
      await this.factory.createOperatorTransport(this.operatorPort).startServer(this.addressService, operatorTransportCallback)
    } catch (e) {
      log.error('Cannot start application', e)
    }
  }

  getType (): ModuleType {
    return ModuleType.Application
  }

  init (): Promise<void> {
    return Promise.resolve()
  }

}

export default Application
