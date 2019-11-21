import { BigNumber } from 'bignumber.js'
import NodeDatabase from './typeOrmDatabase/nodeDatabase'
import Machinomy from 'machinomy'
import { ConnectionOptions } from 'typeorm'

export default class DatabaseFactory {
  readonly defaultPrice: BigNumber
  readonly upstreamAddress: string
  readonly databaseConfig: ConnectionOptions
  readonly databaseUrl: string

  private instances: Map<string, NodeDatabase>

  constructor (defaultPrice: BigNumber, upstreamAddress: string, databaseConfig: ConnectionOptions, databaseUrl: string) {
    this.defaultPrice = defaultPrice
    this.upstreamAddress = upstreamAddress
    this.databaseConfig = databaseConfig
    this.databaseUrl = databaseUrl
    this.instances = new Map()
  }

  async build (account: string, machinomy: Machinomy): Promise<NodeDatabase> {
    let instance = this.instances.get(account)
    if (!instance) {
      instance = new NodeDatabase(this.databaseConfig)
      this.instances.set(account, instance)
    }
    await instance.initConnection()
    return instance
  }

  get (account: string): NodeDatabase {
    let instance = this.instances.get(account)
    if (instance) {
      return instance
    } else {
      throw new Error(`Have no database for account ${account}`)
    }
  }
}
