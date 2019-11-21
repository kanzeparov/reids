import { Core, OperatorTransportFactory, AddressService } from '@onder/common'
import Application from './application'
import Logger from '@machinomy/logger'
import OperatorConfiguration from './Configuration'
const log = new Logger('onder-operator-main')

main().catch((e) => log.error('Operator error', e))

async function main () {
  const core = Core.getInstance()
  const configuration = new OperatorConfiguration()
  await core.addModule(configuration)
  const factory = new OperatorTransportFactory()
  const addressService = new AddressService(configuration.getResolveType(), configuration.domainName)
  const application = new Application(configuration, factory, addressService)
  await core.addModule(application)
  await application.startApplication()
}
