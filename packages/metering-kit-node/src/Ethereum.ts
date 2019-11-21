import WalletOptions from './config/WalletOptions'
import HDWalletProvider from '@machinomy/hdwallet-provider'
import * as Web3 from 'web3'

const TIMEOUT = 3 * 1000 // ms

export default class Ethereum {
  readonly instances: Map<string, Web3>

  static async build (wallets: Array<WalletOptions>, ethereumUrl: string): Promise<Ethereum> {
    let instances = new Map<string, Web3>()
    let promises = wallets.map(async options => {
      // const httpProvider = new Web3.providers.HttpProvider(ethereumUrl, TIMEOUT)
      // const provider = new HDWalletProvider(options.mnemonic, httpProvider, 1)
      const provider = new HDWalletProvider({
        mnemonic: options.mnemonic,
        rpcUrl: ethereumUrl
      })
      const account = options.account.toLowerCase()
      const actuals = await provider.getAddresses()
      const actual = actuals[0]
      if (actual.toLowerCase() !== account) {
        throw new Error(`Mnemonic does not correspond to account ${account}, its address is ${actual}`)
      }
      instances.set(account, new Web3(provider))
    })
    await Promise.all(promises)
    return new Ethereum(instances)
  }

  constructor (instances: Map<string, Web3>) {
    this.instances = instances
  }

  forAccount (account: string): Web3 {
    let instance = this.instances.get(account.toLowerCase())
    if (instance) {
      return instance
    } else {
      throw new Error(`Can not find managed ethereum wallet for account ${account}`)
    }
  }
}
