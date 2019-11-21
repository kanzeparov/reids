import * as Sequelize from 'sequelize'
import { IOperatorDatabase, IOperatorDatabaseRequests } from '@onder/interfaces'
import { Trades } from './models/Trades'
import OperatorDatabaseRequests from './OperatorDatabaseRequests'
import Logger from '@machinomy/logger'
import { Errors } from './models/Errors'
import IOperatorConfiguration from '../interfaces/IOperatorConfiguration'

const log = new Logger('onder-operator-nodedatabase')
enum Dialect {
  sqlite = 'sqlite',
  postgres = 'postgres'
}

export default class OperatorDatabase implements IOperatorDatabase {
  private readonly sequelize: Sequelize.Sequelize
  private readonly models: Sequelize.Models
  private readonly configuration: IOperatorConfiguration
  public requests: IOperatorDatabaseRequests

  constructor (configuration: IOperatorConfiguration) {
    this.configuration = configuration
    this.sequelize = new Sequelize(this.configuration.getDatabaseUrl(), {
      dialect: this.getDialect.bind(this),
      operatorsAliases: false,
      retry: {
        max: 50
      },
      pool: {
        acquire: 120000
      },
      logging: (message?: any) => {
        log.info(message)
      }
    })

    this.models = {
      Trades: Trades(this.sequelize),
      Errors: Errors(this.sequelize)
    }

    this.requests = new OperatorDatabaseRequests(this.models)
  }

  public checkConnection (): PromiseLike<void> {
    return this.sequelize.authenticate()
  }

  public createTables (): Promise<void> {
    return Promise.resolve(this.sequelize.sync({
      force: false
    })
    .then(() => {
      return
    }))
  }

  private getDialect (): Dialect {
    if (this.configuration.getDatabaseUrl().startsWith('postgres')) {
      return Dialect.postgres
    }

    if (this.configuration.getDatabaseUrl().startsWith('sqlite')) {
      return Dialect.sqlite
    }

    throw new Error('Can not define db dialect via connection string')
  }
}
