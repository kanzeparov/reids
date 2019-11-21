import * as Web3 from 'web3'
import { WalletTypes, IMeterConfiguration } from '@onder/interfaces'
import HDWalletProvider from '@machinomy/hdwallet-provider'
import Logger from './Logger'
import MeterConfigurationUtils from './meterconfiguation_utils'

const log = new Logger('wallet-provider')

interface IWalletProvider {
  createProvider (meterConfiguration: IMeterConfiguration): Web3.Provider
  updateConfiguration (meterConfiguration: IMeterConfiguration): Promise<void>
}

class DefaultWalletProviderCreator implements IWalletProvider {
  private readonly ethereumApi: string

  constructor (ethereumApi: string) {
    this.ethereumApi = ethereumApi
  }

  createProvider (meterConfiguration: IMeterConfiguration): Web3.Provider {
    return new Web3.providers.HttpProvider(this.ethereumApi)
  }
  updateConfiguration (meterConfiguration: IMeterConfiguration): Promise<void> {
    return Promise.resolve()
  }
}

class HDWalletProviderCreator implements IWalletProvider {
  private readonly internalProvider: DefaultWalletProviderCreator

  constructor (ethereumApi: string) {
    this.internalProvider = new DefaultWalletProviderCreator(ethereumApi)
  }

  createProvider (meterConfiguration: IMeterConfiguration): Web3.Provider {
    const passwd = MeterConfigurationUtils.getAccountPassword(meterConfiguration)
    return new HDWalletProvider(passwd, this.internalProvider.createProvider(meterConfiguration), 1)
  }

  updateConfiguration (meterConfiguration: IMeterConfiguration): Promise<void> {
    const passwd = MeterConfigurationUtils.getAccountPassword(meterConfiguration)
    const hdwallet = new HDWalletProvider(passwd, this.internalProvider.createProvider(meterConfiguration), 1)
    return hdwallet.getAddress(0).then((address: string) => {
      meterConfiguration.account = address
    })
  }
}

export default class WalletProvider {
  private impl: IWalletProvider
  constructor (walletType: WalletTypes, ethereumApi: string) {
    switch (walletType) {
      case WalletTypes.Web3:
        this.impl = new DefaultWalletProviderCreator(ethereumApi)
        break
      case WalletTypes.HDWalletProvider:
        this.impl = new HDWalletProviderCreator(ethereumApi)
        break
      default:
        log.warn('Unknown type of wallet', walletType)
        this.impl = new DefaultWalletProviderCreator(ethereumApi)
        break
    }
  }

  createProvider (meterConfiguration: IMeterConfiguration): Web3.Provider {
    return this.impl.createProvider(meterConfiguration)
  }

  updateConfiguration (meterConfiguration: IMeterConfiguration): Promise<void> {
    return this.impl.updateConfiguration(meterConfiguration)
  }
}
