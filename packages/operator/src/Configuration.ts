import { Utils } from '@onder/common'
import IOperatorConfiguration from './interfaces/IOperatorConfiguration'
import Logger from '@machinomy/logger'
import { ModuleType, ResolveType } from '@onder/interfaces'

const log = new Logger('onder-operator-operatorconfiguration')

export default class OperatorConfiguration implements IOperatorConfiguration {
  getType (): ModuleType {
    return ModuleType.Configuration
  }
  init (): Promise<void> {
    return Promise.resolve()
  }
  private readonly databaseUrl: string
  private readonly operatorPort: number
  private readonly resolveType: ResolveType
  readonly domainName: string

  constructor () {
    this.domainName = process.env.DOMAIN_NAME
      ? process.env.DOMAIN_NAME
      : 'onder.tech'
    this.databaseUrl = process.env.DB_CONNECTION
      ? process.env.DB_CONNECTION
      : 'sqlite://' + Utils.getConfigurationDir() + 'db.sqlite'

    this.operatorPort = 5000
    const operatorPort = process.env.OPERATOR_PORT
    if (operatorPort) {
      try {
        this.operatorPort = Number.parseInt(operatorPort, 10)
        if (this.operatorPort === 0) {
          this.operatorPort = 5000
        }
      } catch (e) {
        log.error('Error when parse operator port', e)
      }
    }
    this.resolveType = ResolveType.Bonjour
    if (process.env.RESOLVE_TYPE) {
      if (process.env.RESOLVE_TYPE in ResolveType) {
        this.resolveType = process.env.RESOLVE_TYPE as ResolveType
      } else {
        log.warn(`Can't convert string to resolve type from ${process.env.RESOLVE_TYPE}`)
      }
    }
  }

  public getDatabaseUrl (): string {
    return this.databaseUrl
  }

  public getOperatorPort (): number {
    return this.operatorPort
  }

  public getResolveType (): ResolveType {
    return this.resolveType
  }
}
