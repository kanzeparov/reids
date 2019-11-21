import { Configuration, MeterConfigurationUtils } from '@onder/common'
import Logger from '@machinomy/logger'

const log = new Logger('utils-hdwalletcalculator-application')

export default class Application {
  readonly configuration: Configuration

  constructor (configuration: Configuration) {
    process.env.WALLET_TYPE = 'HDWalletProvider'
    process.env.ACCOUNT_PASSWORD = process.env.ACCOUNT
    this.configuration = configuration
  }

  startApplication (): void {
    let config = this.configuration.meterConfiguration[0]
    log.info('Public key for ', MeterConfigurationUtils.getAccountPassword(config), 'is', config.account)
    console.log('Public key for ', MeterConfigurationUtils.getAccountPassword(config), 'is', config.account)
    process.exit(0)
  }
}
