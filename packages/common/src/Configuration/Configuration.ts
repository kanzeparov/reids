import {
  IConfiguration,
  IProxySettings,
  IMeterConfiguration,
  ModuleType,
  ConnectionKind,
  ResolveType,
  WalletTypes } from '@onder/interfaces'
import { BigNumber } from 'bignumber.js'
import * as yaml from 'js-yaml'
import * as fs from 'fs'
import Utils from '../Utils'
import WalletProvider from '../WalletProvider'
import MeterConfigurationUtils from '../meterconfiguation_utils'

import * as dotenv from 'dotenv'
import ProxySettings from './ProxySettings'
import Logger from '../Logger'

dotenv.load()

const log = new Logger('configuration')

export default class Configuration implements IConfiguration {
  public isSeller: boolean
  public meterConfiguration: Array<IMeterConfiguration>
  public workTimeout: number = 3000
  private domainName: string
  private ethereumApi: string
  private problemUri: string
  private databaseUrl: string
  private countersConfigPath: string
  private ownerKey?: string
  private proxySettings: IProxySettings
  public upstreamAddress?: string
  private webInterfacePort: number = 80
  public price: BigNumber
  private resolveType: ResolveType
  private walletType: WalletTypes
  public allowSendStatistic: boolean = true

  constructor () {
    this.price = new BigNumber(10000000000)
    this.isSeller = process.env.ROLE ? process.env.ROLE === 'SELLER' : false
    this.meterConfiguration = []
    this.domainName = process.env.DOMAIN_NAME
      ? process.env.DOMAIN_NAME
      : 'onder.io'
    this.ethereumApi = process.env.ETHEREUM_API
      ? process.env.ETHEREUM_API
      : 'http://localhost:8545'
    this.problemUri = process.env.PROBLEM_URL
      ? process.env.PROBLEM_URL
      : 'http://localhost:6660/problem'
    this.databaseUrl = process.env.DB_CONNECTION
      ? process.env.DB_CONNECTION
      : 'sqlite://' + Utils.getConfigurationDir() + 'db.sqlite'
    this.countersConfigPath = process.env.COUNTER_CONFIG_PATH
      ? process.env.COUNTER_CONFIG_PATH
      : Utils.getConfigurationDir() + 'meters.yml'
    this.webInterfacePort = process.env.WEB_INTERFACE_PORT
      ? +process.env.WEB_INTERFACE_PORT
      : 80
    this.resolveType = ResolveType.Bonjour
    if (process.env.RESOLVE_TYPE) {
      if (process.env.RESOLVE_TYPE in ResolveType) {
        this.resolveType = process.env.RESOLVE_TYPE as ResolveType
      } else {
        log.warn(`Can't convert string to resolve type from ${process.env.RESOLVE_TYPE}`)
      }
    }
    this.walletType = WalletTypes.Web3
    if (process.env.WALLET_TYPE) {
      if (process.env.WALLET_TYPE in WalletTypes) {
        this.walletType = process.env.WALLET_TYPE as WalletTypes
      } else {
        log.warn(`Can't convert string to resolve type from ${process.env.WALLET_TYPE}`)
      }
    }
    this.proxySettings = new ProxySettings()
  }

  public getType (): ModuleType {
    return ModuleType.Configuration
  }

  public getDomainName (): string {
    return this.domainName
  }

  public getProblemUri (): string {
    return this.problemUri
  }

  public getEthereumApi (): string {
    return this.ethereumApi
  }

  public getDatabaseUrl (): string {
    return this.databaseUrl
  }

  public getWebInterfacePort (): number {
    return this.webInterfacePort
  }

  async init (): Promise<void> {
    const timeoutEnv = process.env.WORKTIMEOUT
    if (timeoutEnv !== undefined) {
      this.workTimeout = Number.parseInt(timeoutEnv, 10) || 3000
    }
    this.ownerKey = process.env.OWNERKEY
    this.upstreamAddress = process.env.UPSTREAMADDRESS
    this.meterConfiguration = this.loadCountersConfig()
    this.meterConfiguration.forEach((conf: IMeterConfiguration) => {
      // FIXME ONDER ALPHA
      // if (conf.kind === ConnectionKind.OnderAlpha) {
      //   conf.account = Utils.generate_key()
      //   for (let index = 0; index < conf.accounts.length; ++index) {
      //     if (!conf.accounts[index] || conf.accounts[index] === '') {
      //       continue
      //     }
      //     this.meterConfiguration.push({
      //       kind: ConnectionKind.OnderAlphaChild,
      //       account: conf.accounts[index],
      //       password: conf.passwords ? conf.passwords[index] : undefined,
      //       faultValue: conf.faultValue,
      //       port: conf.port,
      //       index: index,
      //       parentAccount: conf.account
      //     } as IMeterConfigurationOnderAlphaChild)
      //   }
      // }
    })

    log.debug('Updating meters configurations..')
    for (let index = 0; index < this.meterConfiguration.length; ++index) {
      let conf = this.meterConfiguration[index]
      // FIXME ONDER ALPHA
      // if (conf.kind === ConnectionKind.OnderAlpha) {
      //   continue
      // }
      log.debug('Updating meter configuration ', conf)
      const walletType = this.getWalletType()
      const ethereumApi = this.getEthereumApi()
      let walletProvider = new WalletProvider(walletType, ethereumApi)
      await walletProvider.updateConfiguration(conf).then(() => {
        this.meterConfiguration[index] = conf
      }).catch((reason: any) => {
        log.error('Can\'t convert password to account', reason)
      })
      log.debug('Updating meter configuration done ',conf)
    }
    log.debug('Updating meters configurations done')

    log.debug('Checks meters configurations..')
    let toRemove: Array < number > = []
    for (let index = 0; index < this.meterConfiguration.length; ++index) {
      let conf: IMeterConfiguration = this.meterConfiguration[index]
      if (conf.kind === ConnectionKind.Zero) {
        continue
      }
      if (!MeterConfigurationUtils.isIMeterConfiguration(conf)) {
        toRemove.push(index)
        log.warn('Configuration ', index, ' not correct!', conf)
      }
    }
    toRemove.reverse().forEach((value: number) => {
      this.meterConfiguration.splice(value, 1)
    })
    log.debug('Checks meters configurations done')
    return Promise.resolve()
  }
  private containConfiguration (meterConfiguration: IMeterConfiguration): boolean {
    if (this.meterConfiguration.indexOf(meterConfiguration) > 0) {
      return true
    }
    return this.meterConfiguration.indexOf(meterConfiguration) > 0
  }

  // Can called only from application
  public addMeter (meterConfiguration: IMeterConfiguration) {
    if (this.containConfiguration(meterConfiguration)) {
      return
    }
    this.meterConfiguration.push(meterConfiguration)
  }

  public setSeller (): void {
    this.isSeller = true
  }

  public getOwnerKey (): string | undefined {
    return this.ownerKey
  }

  public getProxySettings (): IProxySettings {
    return this.proxySettings
  }

  public getResolveType (): ResolveType {
    return this.resolveType
  }

  getWalletType (): WalletTypes {
    return this.walletType
  }

  private loadCountersConfig (): IMeterConfiguration[] {
    const configFileExists = fs.existsSync(this.countersConfigPath)

    if (configFileExists) {
      try {
        return yaml.safeLoad(fs.readFileSync(this.countersConfigPath, 'utf8'))
      } catch {
        throw new Error('Meters config file can not load.')
      }
    }

    const key = process.env.ACCOUNT
    if (!key) throw new Error('Please, set ACCOUNT env variable')

    return [
      {
        account: key,
        kind: ConnectionKind.Zero
      }
    ]
  }
}
