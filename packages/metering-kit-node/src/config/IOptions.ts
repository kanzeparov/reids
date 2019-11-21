import { IMeterConfiguration } from '@onder/interfaces'
import { BigNumber } from 'bignumber.js'
import WalletOptions from './WalletOptions'
import { URL } from 'url'
import { ConnectionOptions } from 'typeorm'

export default interface IOptions {
  readonly quantum: number
  readonly meters: Array<IMeterConfiguration>
  readonly webInterfacePort: number
  readonly host: string
  readonly tradePort: number
  readonly tradeHost: string
  readonly databaseUrl: string,
  readonly cellName: string,
  readonly databaseConfig: ConnectionOptions
  readonly resolver: {
    kind: string,
    domain?: string
  }
  readonly proxy: string
  readonly defaultPrice: BigNumber
  readonly upstreamAccount: string
  readonly wallets: Array<WalletOptions>
  readonly ethereumUrl: string
  readonly allowSendStatistic: boolean
  readonly isSeller: boolean
  readonly storeErrors: boolean
  readonly dsmUrl: URL
  readonly operatorUrl: URL | undefined
  readonly minimumChannelAmount: BigNumber | undefined
  readonly tokenContract: string
}
