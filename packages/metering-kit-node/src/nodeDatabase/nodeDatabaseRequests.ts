import { IMeterValue, IError, ILightPartner, ITrade, ILightPayment, PaymentState } from '@onder/interfaces'
import { Trade, MeterValue, Utils, ErrorSerializer, LightPayment } from '@onder/common'
import * as moment from 'moment'
import * as sequelize from 'sequelize'
import { Machinomy, Payment } from 'machinomy'
import { MeasurementAttr } from './models/Measurements'
import { AddDownstreamPayments, DownstreamPaymentsAttr } from './models/DownstreamPayments'
import { BigNumber } from 'bignumber.js'
import { IModelsSequelize, Dialect } from './nodeDatabase'
import Logger from '../Logger'

const log = new Logger('node-database-requests')

export default class NodeDatabaseRequests {
  private readonly models: IModelsSequelize
  private readonly account: string
  private readonly defaultPrice: BigNumber
  private readonly upstreamAddress: string
  private readonly machinomy: Machinomy
  private readonly dialect: Dialect

  constructor (models: IModelsSequelize, account: string, defaultPrice: BigNumber, upstreamAddress: string, dialect: Dialect, machinomy: Machinomy) {
    this.models = models
    this.account = account
    this.defaultPrice = defaultPrice
    this.upstreamAddress = upstreamAddress
    this.dialect = dialect
    this.machinomy = machinomy
  }

  /**
   * Add measurement to database and update metervalue.id
   * returns a really updated or inserted indexes
   */
  async addMeasurement (meterValue: IMeterValue): Promise<void> {
    try {
      const found = await this.models.Measurements.findOne({
        where: {
          key: this.account,
          timestamp: meterValue.datetime.valueOf()
        }
      })
      if (found) {
        await this.models.Measurements.update({
          value: meterValue.value.toNumber(),
          delta: meterValue.delta.toNumber(),
        }, {
          where: {
            key: this.account,
            timestamp: meterValue.datetime.valueOf()
          }
        })
        meterValue.id = new BigNumber(found.ID_measurements)
      } else {
        const r = await this.models.Measurements.create({ // tslint:disable-line await-promise
          key: this.account,
          value: meterValue.value.toNumber(),
          delta: meterValue.delta.toNumber(),
          timestamp: meterValue.datetime.valueOf()
        })
        meterValue.id = new BigNumber(r.ID_measurements)
      }
    } catch (e) {
      log.warn('Measurement updated now! You have a problem', meterValue.datetime.toISOString(), e)
      let result = await this.models.Measurements.update({ // tslint:disable-line await-promise
        value: meterValue.value.toNumber(),
        delta: meterValue.delta.toNumber()
      }, {
        where: {
          key: this.account,
          timestamp: meterValue.datetime.valueOf()
        }
      })
      log.debug('Got result of an update', result)
      const affectedCount = result[0]
      if (affectedCount === 0) {
        throw new Error('Can not update')
      } else {
        let record = await this.models.Measurements.find({ // tslint:disable-line await-promise
          where: {
            key: this.account,
            timestamp: meterValue.datetime.valueOf()
          }
        })
        if (record) {
          meterValue.id = new BigNumber(record.ID_measurements)
        }
      }
    }
  }

  async addMeasurements (meterValues: Array<IMeterValue>): Promise<void> {
    let promises = meterValues.map(async incoming => {
      let found = await this.models.Measurements.find({ // tslint:disable-line await-promise
        where: {
          key: this.account,
          timestamp: incoming.datetime.valueOf()
        }
      })
      if (found) {
        await this.models.Measurements.update({ // tslint:disable-line await-promise
          value: incoming.value.toNumber(),
          delta: incoming.delta.toNumber()
        }, {
          where: {
            ID_measurements: found.ID_measurements
          }
        })
      } else {
        await this.models.Measurements.create({ // tslint:disable-line await-promise
          key: this.account,
          value: incoming.value.toNumber(),
          delta: incoming.delta.toNumber(),
          timestamp: incoming.datetime.valueOf()
        })
      }
    })
    await Promise.all(promises)
  }

  /**
   * Add trade to database
   */
  async addTrade (meterValue: IMeterValue, token: string): Promise<ITrade> {
    const time = moment().utc()
    const payment = await this.machinomy.paymentById(token)
    if (!payment) throw new Error('payment is null')

    await this.models.Trades.create({ // tslint:disable-line await-promise
      ID_measurements: meterValue.id.toNumber(),
      token: token,
      timestamp: time.valueOf()
    })
    return new Trade(time, meterValue, payment)
  }

  getTrades (from: moment.Moment, to = moment.utc()) {
    const payments: { [key: string]: Payment } = {}
    const Op = sequelize.Op

    return Promise.resolve(this.models.Measurements.findAll<MeasurementAttr>({
      where: {
        timestamp: {
          [Op.gte]: from.valueOf(),
          [Op.lte]: to.utc().valueOf()
        },
        key: this.account
      },
      include: [
        {
          as: 'trade',
          model: this.models.Trades,
          required: true
        }
      ]
    })
        .then(async (data) => {

          return Promise.all(data.map((obj) => {
            if (!this.machinomy) {
              log.error('getTrades: Machinomy is undefined')
              return Promise.reject('Machinomy is undefined')
            }
            return this.machinomy.paymentById(obj.trade!.token)
                .then((payment) => {
                  payments[obj.trade!.token] = payment as Payment
                })
          }
          ))
            .then(() => {
              return data.map((obj) => {
                const meterValue = new MeterValue(new BigNumber(Utils.round(obj.value)),
                  new BigNumber(Utils.round(obj.delta)), moment(Number(obj.timestamp)).utc(), new BigNumber(obj.ID_measurements))
                return new Trade(moment(Number(obj.trade!.timestamp)).utc(), meterValue, payments[obj.trade!.token])
              })
            })
        })
    )
  }

  async getTradesLimited (limit: number): Promise<Array<ITrade>> {
    const payments: { [key: string]: Payment } = {}

    return this.models.Measurements.findAll<MeasurementAttr>({
      where: {
        key: this.account
      },
      order: [['timestamp', 'DESC']],
      limit: limit,
      include: [
        {
          as: 'trade',
          model: this.models.Trades,
          required: true
        }
      ]
    })
        .then(async (data) => {

          return Promise.all(data.map((obj) => {
            return this.machinomy.paymentById(obj.trade!.token)
                .then((payment) => {
                  payments[obj.trade!.token] = payment as Payment
                })
          }
          ))
            .then(() => {
              return data.map((obj) => {
                const meterValue = new MeterValue(new BigNumber(Utils.round(obj.value)),
                  new BigNumber(Utils.round(obj.delta)), moment(Number(obj.timestamp)).utc(), new BigNumber(obj.ID_measurements))
                return new Trade(moment(Number(obj.trade!.timestamp)).utc(), meterValue, payments[obj.trade!.token])
              })
            })
        })
  }

  /**
   * Get all meter values since date
   */
  async getMeasurements (from?: moment.Moment, to: moment.Moment = moment.utc()): Promise<Array<MeterValue>> {
    const Op = sequelize.Op
    const findOptions = from
      ? {
        where: {
          key: this.account,
          timestamp: {
            [Op.gte]: from.utc().valueOf(),
            [Op.lte]: to.utc().valueOf()
          }
        },
        order: [
          ['timestamp', 'ASC']
        ]
      }
      : {
        where: {
          key: this.account
        },
        order: [
          ['timestamp', 'DESC']
        ],
        limit: 1
      }

    const rows = await this.models.Measurements.findAll<MeasurementAttr>(findOptions) // tslint:disable-line await-promise
    return rows.map(row => {
      return new MeterValue(new BigNumber(Utils.round(row.value)), new BigNumber(Utils.round(row.delta)), moment(Number(row.timestamp)).utc(), new BigNumber(row.ID_measurements))
    })
  }

  async getUnpaidMeasurements (): Promise<IMeterValue[]> {
    const Op = sequelize.Op
    let data = await this.models.Measurements.findAll<MeasurementAttr>({ // tslint:disable-line await-promise
      where: {
        key: this.account,
        ID_measurements: {
          [Op.notIn]: sequelize.literal('(SELECT "ID_measurements" FROM trades)')
        }/*, TODO: Uncomment when we will live not ideal world
        delta: {
          [Op.gt]: 0
        }*/
      }
    })
    return data.map(obj => {
      return new MeterValue(new BigNumber(Utils.round(obj.value)), new BigNumber(Utils.round(obj.delta)), moment(Number(obj.timestamp)).utc(), new BigNumber(obj.ID_measurements))
    })
  }

  async updatePrice (datetime: moment.Moment, newPrice: BigNumber): Promise<void> {
    let oldPrice = await this.getPrice(datetime)
    if (!newPrice.equals(oldPrice)) {
      await this.models.Prices.create({ // tslint:disable-line await-promise
        price: newPrice.toNumber(),
        timestamp: datetime.utc().valueOf()
      })
    }
  }

  async getPrice (datetime: moment.Moment): Promise<BigNumber> {
    let row = await this.models.Prices.findOne({ // tslint:disable-line await-promise
      where: {
        timestamp: {
          [sequelize.Op.lt]: datetime.utc().valueOf()
        }
      },
      order: [
        ['timestamp', 'ASC']
      ]
    })
    return row ? new BigNumber(row.price) : this.defaultPrice
  }

  async addPayment (payment: ILightPayment): Promise<void> {
    await this.models.DownstreamPayments.create({  // tslint:disable-line await-promise
      power: payment.power.toNumber(),
      price: payment.price.toNumber(),
      token: payment.token,
      upstreamKey: payment.receiver,
      downstreamKey: payment.sender,
      timestamp: payment.datetime.utc().valueOf()
    }, {
      validate: true
    }).catch(() => {
      return this.updatePayment(payment)
    })
  }

  async updatePayment (payment: ILightPayment): Promise<void> {
    await this.models.DownstreamPayments.update({ // tslint:disable-line await-promise
      power: payment.power.toNumber(),
      price: payment.price.toNumber(),
      token: payment.token
    }, {
      where: {
        upstreamKey: payment.receiver,
        downstreamKey: payment.sender,
        timestamp: payment.datetime.utc().valueOf()
      }
    })
  }

  async deletePayment (payment: ILightPayment): Promise<void> {
    await this.models.DownstreamPayments.destroy({ // tslint:disable-line await-promise
      where: {
        upstreamKey: payment.receiver,
        downstreamKey: payment.sender,
        timestamp: payment.datetime.utc().valueOf()
      }
    })
  }

  async getPayments (from: moment.Moment, to: moment.Moment = moment.utc()): Promise<Array<LightPayment>> {
    let rows = await this.models.DownstreamPayments.findAll<AddDownstreamPayments>({ // tslint:disable-line await-promise
      where: {
        upstreamKey: this.account,
        timestamp: {
          [sequelize.Op.gte]: from.utc().valueOf(),
          [sequelize.Op.lte]: to.utc().valueOf()
        }
      },
      order: [
        ['timestamp', 'DESC']
      ]
    })
    return rows.map(row => {
      return new LightPayment(
        row.token,
        row.downstreamKey,
        row.upstreamKey,
        new BigNumber(row.power),
        new BigNumber(row.price),
        moment(Number(row.timestamp)).utc(),
        PaymentState.off_chain // TODO: need check channel state for time and if it less then time then on_chain
      )
    })
  }

  public getPaymentsLimited (limit: number) {
    const Op = sequelize.Op
    return Promise.resolve(this.models.DownstreamPayments.findAll<AddDownstreamPayments>({
      where: {
        upstreamKey: this.account
      },
      order: [
        ['timestamp', 'DESC']
      ],
      limit: limit
    }))
    .then((data: DownstreamPaymentsAttr[]) => {
      return data.map((obj) => {
        return new LightPayment(
          obj.token,
          obj.downstreamKey,
          obj.upstreamKey,
          new BigNumber(obj.power),
          new BigNumber(obj.price),
          moment(Number(obj.timestamp)).utc(),
          PaymentState.off_chain // TODO: need check channel state for time and if it less then time then on_chain
        )
      })
    })
  }

  async addError (error: IError): Promise<void> {
    if (!('date' in error) || !('account' in error)) {
      log.warn(error.type, 'not supported!')
      return
    }

    await this.models.Errors.create({ // tslint:disable-line await-promise
      key: error.account,
      timestamp: error.date.utc().valueOf(),
      type: error.type,
      meta: ErrorSerializer.serializeError(error)
    })
  }

  async getErrors (): Promise<Array<IError>> {
    const data = await this.models.Errors.findAll({ // tslint:disable-line await-promise
      where: { key: this.account },
      order: [
        ['timestamp', 'ASC']
      ]
    })
    let result: Array<IError> = []
    let promises: Array<Promise<void>> = []
    data.forEach((obj, index) => {
      promises[index] = ErrorSerializer.deserializeError(obj.type, obj.meta).then(err => {
        result[index] = err
      }).catch((reason: any) => {
        log.error('Error when deserialize error ', obj.meta)
        return Promise.reject(reason)
      })
    })
    await Promise.all(promises)
    return result
  }

  async deleteError (error: IError): Promise<void> {
    if (!('date' in error)) {
      log.warn(error.type, 'not supported!')
      return Promise.resolve()
    }
    await this.models.Errors.destroy({ // tslint:disable-line await-promise
      where: {
        key: this.account,
        timestamp: error.date.utc().valueOf(),
        type: error.type
      }
    })
  }

  async getInteractionWithCounterpart (account: string, from: moment.Moment): Promise<Array<ILightPartner>> {
    const Op = sequelize.Op

    let response = new Map<string, ILightPartner>()

    // const owes = await this.models.Channel.findAll({
    //   attributes: [
    //     [sequelize.literal(`SUM ( CASE
    //       WHEN Channel.sender = "${account}"
    //       THEN Channel.value - Channel.spent
    //       ELSE Channel.spent
    //     END)`), 'total'],
    //     [sequelize.literal(`CASE
    //       WHEN Channel.sender = "${account}"
    //       THEN Channel.receiver
    //       ELSE Channel.sender
    //     END`), 'counterpart']
    //   ],
    //   where: {
    //     state: {
    //       [Op.notIn]: 2
    //     },
    //     [Op.or]: [
    //       { sender: account },
    //       { receiver: account }
    //     ]
    //   },
    //   group: sequelize.literal(`CASE WHEN Channel.sender = "${account}" THEN Channel.receiver ELSE Channel.sender END`)
    // })

    const buys = await this.models.DownstreamPayments.findAll({ // tslint:disable-line await-promise
      attributes: [
        'downstreamKey',
        [sequelize.fn('sum', sequelize.col('power')), 'power'],
        [sequelize.fn('sum', sequelize.col('price')), 'price'],
        [sequelize.fn('max', sequelize.col('timestamp')), 'timestamp']
      ],
      where: {
        upstreamKey: account,
        timestamp: {
          [Op.gte]: from.valueOf()
        }
      },
      group: [
        'downstreamKey'
      ]
    })

    const sells = await this.models.Payment.findAll({ // tslint:disable-line await-promise
      attributes: [
        'receiver',
        [sequelize.fn('sum', sequelize.col('price')), 'price'],
        [sequelize.fn('max', sequelize.col('createdAt')), 'createdAt']
      ],
      where: {
        sender: account,
        createdAt: {
          [Op.gte]: from.valueOf()
        }
      },
      include: [
        {
          as: 'trade',
          model: this.models.Trades,
          required: true,
          include: [
            {
              as: 'measurement',
              model: this.models.Measurements,
              required: true
            }
          ]
        }
      ],
      group: [
        'receiver',
        'trade.ID_trades',
        'trade->measurement.ID_measurements'
      ]
    })

    const sumUnpaidMeasurements = await this.models.Measurements.findOne({ // tslint:disable-line await-promise
      attributes: [
        [sequelize.fn('sum', sequelize.col('delta')), 'delta'],
        [sequelize.fn('max', sequelize.col('timestamp')), 'timestamp']
      ],
      where: {
        key: account,
        ID_measurements: {
          [Op.notIn]: sequelize.literal('(SELECT "ID_measurements" FROM trades)')
        },
        timestamp: {
          [Op.gte]: from.valueOf()
        }
      }
    })

    // owes.forEach((owe) => {
    //   response.set(owe.dataValues.counterpart, {
    //     account: owe.dataValues.counterpart,
    //     owes: new BigNumber(Utils.round(owe.dataValues.total).toString()),
    //     buysPower: new BigNumber(0),
    //     buysTotalPrice: new BigNumber(0),
    //     sellsPower: new BigNumber(0),
    //     sellsTotalPrice: new BigNumber(0),
    //     lastUpdate: moment()
    //   })
    // })

    buys.forEach((buy) => {
      let downstream = response.get(buy.downstreamKey)
      if (downstream) {
        downstream.buysPower = new BigNumber(Utils.round(buy.power))
        downstream.buysTotalPrice = new BigNumber(Utils.round(buy.price))
        downstream.lastUpdate = moment(Number(buy.timestamp)).utc()
      } else {
        downstream = {
          account: buy.downstreamKey,
          owes: new BigNumber(0),
          buysPower: new BigNumber(Utils.round(buy.power)),
          buysTotalPrice: new BigNumber(Utils.round(buy.price)),
          sellsPower: new BigNumber(0),
          sellsTotalPrice: new BigNumber(0),
          lastUpdate: moment(Number(buy.timestamp)).utc()
        }
      }
      response.set(buy.downstreamKey, downstream)
    })

    sells.forEach(sell => {
      let lastUpdate = moment(sell.createdAt).utc()
      let counterpart = response.get(sell.counterpart)
      if (counterpart && counterpart.lastUpdate && counterpart.lastUpdate.isBefore(lastUpdate)) {
        lastUpdate = counterpart.lastUpdate
      }

      if (counterpart) {
        counterpart.sellsPower = new BigNumber(Utils.round(sell.powerSells))
        counterpart.sellsTotalPrice = new BigNumber(Utils.round(sell.totalSells))
        counterpart.lastUpdate = lastUpdate
      } else {
        counterpart = {
          account: sell.counterpart,
          owes: new BigNumber(0),
          buysPower: new BigNumber(0),
          buysTotalPrice: new BigNumber(0),
          sellsPower: new BigNumber(Utils.round(sell.powerSells)),
          sellsTotalPrice: new BigNumber(Utils.round(sell.totalSells)),
          lastUpdate: lastUpdate
        }
      }
      response.set(sell.counterpart, counterpart)
    })

    if (sumUnpaidMeasurements && sumUnpaidMeasurements.delta > 0) {
      const currentUpstream = this.upstreamAddress
      let lastUpdate = moment(sumUnpaidMeasurements.timestamp).utc()
      let upstream = response.get(currentUpstream)
      if (upstream && upstream.lastUpdate && upstream.lastUpdate.isBefore(lastUpdate)) {
        lastUpdate = upstream.lastUpdate
      }

      if (upstream) {
        upstream.sellsPower = upstream.sellsPower.plus(Utils.round(sumUnpaidMeasurements.delta))
      } else {
        upstream = {
          account: currentUpstream,
          owes: new BigNumber(0),
          buysPower: new BigNumber(0),
          buysTotalPrice: new BigNumber(0),
          sellsPower: new BigNumber(Utils.round(sumUnpaidMeasurements.delta)),
          sellsTotalPrice: new BigNumber(0),
          lastUpdate: lastUpdate
        }
      }
      response.set(currentUpstream, upstream)
    }

    return Array.from(response.values())
  }
}
