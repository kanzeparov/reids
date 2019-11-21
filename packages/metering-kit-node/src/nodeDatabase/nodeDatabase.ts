import * as Sequelize from 'sequelize'
import { Measurements, MeasurementAttr, AddMeasurement } from './models/Measurements'
import { Trades, TradeAttr, AddTrade } from './models/Trades'
import { DownstreamPayments, AddDownstreamPayments, DownstreamPaymentsAttr } from './models/DownstreamPayments'
import { Prices, AddPrices, PricesAttr } from './models/Prices'
import { Errors, ErrorAttr, AddError } from './models/Errors'
import { Channel, ChannelAttr, AddChannel } from './models/Channel'
import { Payment, PaymentAttr, AddPayment } from './models/Payment'
import NodeDatabaseRequests from './nodeDatabaseRequests'
import { BigNumber } from 'bignumber.js'
import Logger from '../Logger'
import Machinomy from 'machinomy'

const log = new Logger('node-database')

export enum Dialect {
  sqlite = 'sqlite',
  postgres = 'postgres'
}

export interface IModelsSequelize {
  Measurements: Sequelize.Model<MeasurementAttr, AddMeasurement>
  Trades: Sequelize.Model<TradeAttr, AddTrade>
  DownstreamPayments: Sequelize.Model<DownstreamPaymentsAttr, AddDownstreamPayments>
  Prices: Sequelize.Model<PricesAttr, AddPrices>
  Errors: Sequelize.Model<ErrorAttr, AddError>
  Channel: Sequelize.Model<ChannelAttr, AddChannel>
  Payment: Sequelize.Model<PaymentAttr, AddPayment>
}

export default class NodeDatabase {
  private readonly sequelize: Sequelize.Sequelize
  private readonly models: IModelsSequelize
  private readonly databaseUrl: string
  requests: NodeDatabaseRequests

  constructor (account: string, defaultPrice: BigNumber, upstreamAddress: string, databaseUrl: string, machinomy: Machinomy) {
    this.databaseUrl = databaseUrl
    this.sequelize = new Sequelize(databaseUrl, {
      dialect: this.getDialect(),
      operatorsAliases: false,
      pool: {
        acquire: 120000
      },
      logging: (message?: any) => {
        log.info(message)
      }
    })

    this.models = {
      Measurements: Measurements(this.sequelize),
      Trades: Trades(this.sequelize),
      DownstreamPayments: DownstreamPayments(this.sequelize),
      Prices: Prices(this.sequelize),
      Errors: Errors(this.sequelize),
      // machinomy models
      Channel: Channel(this.sequelize),
      Payment: Payment(this.sequelize)
    }

    this.requests = new NodeDatabaseRequests(this.models, account, defaultPrice, upstreamAddress, this.getDialect(), machinomy)
  }

  async checkConnection (): Promise<void> {
    return this.sequelize.authenticate()
  }

  async createTables (): Promise<void> {
    // No machinomy tables
    const needCreateTables = [
      this.models.Measurements,
      this.models.Trades,
      this.models.DownstreamPayments,
      this.models.Prices,
      this.models.Errors
    ]
    await Promise.all(needCreateTables.map((model: Sequelize.Model<any, any>) => model.sync({ force: false })))

    if (this.getDialect() === Dialect.sqlite) {
      await this.sequelize.query('PRAGMA journal_mode = WAL;') // tslint:disable-line await-promise
    }

    this.models.Measurements.hasOne(this.models.Trades, {
      as: 'trade',
      foreignKey: 'ID_measurements',
      constraints: true
    })

    this.models.Trades.belongsTo(this.models.Measurements, {
      as: 'measurement',
      foreignKey: 'ID_measurements',
      constraints: false
    })

    // this.models.Payment.belongsTo(this.models.Trades, {
    //   as: 'trade',
    //   foreignKey: 'token',
    //   targetKey: 'token',
    //   constraints: false
    // })
  }

  private getDialect (): Dialect {
    if (this.databaseUrl.startsWith('postgresql')) {
      return Dialect.postgres
    }

    if (this.databaseUrl.startsWith('sqlite')) {
      return Dialect.sqlite
    }

    throw new Error('Can not define db dialect via connection string')
  }
}
