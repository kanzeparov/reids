import { LightPayment, Utils } from '@onder/common'
import {
  IBuyerListener,
  IMeterConfiguration,
  ISellerListener,
  ITrade,
  RoomPeriod,
  WebRoomName,
  ILightPayment,
  PaymentState,
  ErrorType,
  IError,
  IPaymentsRoomRequest,
  PaymentsRoomResponseSerde,
  webproto,
  WASTED_ADDRESS
} from '@onder/interfaces'
import * as moment from 'moment'
import * as io from 'socket.io'
import WebServer from '../WebServer'
import ARoom from './ARoom'
import ProblemController from '../../ProblemController'
import { BigNumber } from 'bignumber.js'
import NodeDatabase from '../../nodeDatabase/nodeDatabase'
import Logger from '../../Logger'

const log = new Logger('payments-room')
const GRAPH_COLUMN_COUNT = 100

export default class PaymentsRoom extends ARoom implements IBuyerListener, ISellerListener {
  roomID: string
  roomType = webproto.RoomType.Payments
  roomPeriod: RoomPeriod
  private readonly account: string
  private db: NodeDatabase
  private problemController: ProblemController
  private internalStorageBuy: Map<number, LightPayment>
  private internalStorageSell: Map<number, LightPayment>
  private internalStorageWasted: Map<number, LightPayment>
  private workTimeout: number

  constructor (account: string, db: NodeDatabase, webServer: WebServer, period: RoomPeriod, problemController: ProblemController) {
    super(webServer.ioapp)
    this.account = account
    this.db = db
    this.problemController = problemController
    this.roomID = `${WebRoomName.Payments}_${this.account}_${period}`
    this.roomPeriod = period
    this.workTimeout = this.calculateWorkTimeout()
    this.internalStorageBuy = new Map()
    this.internalStorageSell = new Map()
    this.internalStorageWasted = new Map()
  }

  async join (socket: io.Socket, request: IPaymentsRoomRequest): Promise<void> {
    this.realjoin(socket)
    const allPayments = [
      ...this.internalStorageBuy.values(),
      ...this.internalStorageSell.values(),
      ...this.internalStorageWasted.values()
    ].sort((a, b) => a.datetime.valueOf() - b.datetime.valueOf())
    const response = PaymentsRoomResponseSerde.serialize({ values: allPayments })
    socket.emit(this.roomID, webproto.PaymentsRoomResponse.encode(response).finish())
  }

  async onBuy (trade: ITrade): Promise<void> {
    await this.whenConnected(async () => {
      log.info(`Got buy trade for room ${this.roomID}`)
      const p = trade.getPayment()
      const m = trade.getMeasurement()
      let from = ARoom.from(this.roomPeriod)
      const isIncluded = m.datetime.valueOf() >= from.valueOf()
      if (isIncluded) {
        const item = new LightPayment(p.token || '', p.sender, p.receiver, m.delta, p.price, m.datetime, PaymentState.off_chain)
        await this.broadcastPayments([item])
      } else {
        log.info(`Measurement is not in the interval starting at ${from.toISOString()}`)
      }
    })
  }

  async onSell (payment: ILightPayment): Promise<void> {
    await this.whenConnected(async () => {
      log.info(`Got sell trade for room ${this.roomID}`)
      const from = ARoom.from(this.roomPeriod)
      if (payment.datetime < from) {
        log.info(`Measurement is not in the interval starting at ${from.toISOString()}`)
        return
      }
      let item = undefined
      const date = this.intervalStart(payment.datetime)
      if (payment.sender === WASTED_ADDRESS) {
        item = Object.assign({}, payment)
        this.internalStorageWasted.set(date.valueOf(), item) // push copy!
        const it = this.internalStorageWasted.get(date.valueOf())
        if (it) it.datetime = date
      } else {
        item = this.internalStorageSell.get(date.valueOf())
        if (!item) {
          item = Object.assign({}, payment)
          this.internalStorageSell.set(date.valueOf(), item) // push copy!
          const it = this.internalStorageSell.get(date.valueOf())
          it!.datetime = date // tslint:disable-line no-unnecessary-type-assertion
        } else {
          item.power = item.power.plus(payment.power)
          item.price = item.price.plus(payment.price)
          item.total = item.total.plus(payment.total)
          item.state = PaymentState.off_chain // TODO: add check for on chain
        }
      }
      this.cleanInternalStorages()
      return this.broadcastPayments([item])
    })
  }

  async onInit (configuration: IMeterConfiguration, errors: IError[]): Promise<void> {
    await this.whenConnected(async () => {
      if (configuration.account !== this.account) {
        return
      }
      const items = errors.reduce((acc, error) => {
        if (!('date' in error)) {
          return acc
        }
        const item = this.internalStorageBuy.get(this.intervalStart(error.date).valueOf())
        let state = PaymentState.no_response
        if (error) {
          switch (error.type) {
            case ErrorType.BuyChannelNotExist:
              state = PaymentState.no_channel
              break
            case ErrorType.BuyNotEnoughMoney:
              state = PaymentState.no_deposit
              break
          }
        }
        if (item && item.state < state) {
          item.state = state
          acc.push(item)
        }
        return acc
      }, new Array<LightPayment>())
      await this.broadcastPayments(items)
    })
  }

  async onProblemReport (configuration: IMeterConfiguration, error: IError): Promise<void> {
    await this.whenConnected(async () => {
      if (!('date' in error)) {
        return
      }
      const from = ARoom.from(this.roomPeriod)
      if (error.date < from) {
        return
      }
      let state = PaymentState.no_response
      if (error) {
        switch (error.type) {
          case ErrorType.BuyChannelNotExist:
            state = PaymentState.no_channel
            break
          case ErrorType.BuyNotEnoughMoney:
            state = PaymentState.no_deposit
            break
        }
      }
      const date = this.intervalStart(error.date)
      let item = this.internalStorageBuy.get(date.valueOf())
      if (!item) {
        // TODO: may be need search another error for priority.
        // As example we may have a no_deposit and no_channel errors but no_deposit have a high priority
        const measurements = await this.db.requests.getMeasurements(date, date.clone().add(this.workTimeout - 1, 'ms'))
        if (measurements.length === 0) {
          return
        }
        const value = measurements[0]
        let result = new LightPayment('', this.account, '', value.delta,
          new BigNumber(0), this.intervalStart(value.datetime), state)
        for (let i = 1; i < measurements.length; ++i) {
          result.power = result.power.add(measurements[0].delta)
        }
        this.internalStorageBuy.set(date.valueOf(), result)
        item = result
      } else if (state > item.state) {
        item.state = state
      }
      return this.broadcastPayments([item])
    })
  }

  async initRoom (): Promise<void> {
    // gets downstream payments
    const from = ARoom.from(this.roomPeriod)
    let downstream = await this.db.requests.getPayments(from)
    // simple save to internal storage as sell
    downstream.forEach(payment => {
      const date = this.intervalStart(payment.datetime)
      if (payment.sender === WASTED_ADDRESS) { // wasted only replace!
        this.internalStorageWasted.set(date.valueOf(), payment)
        const item = this.internalStorageWasted.get(date.valueOf())
        item!.datetime = date // tslint:disable-line no-unnecessary-type-assertion
      } else {
        const item = this.internalStorageSell.get(date.valueOf())
        if (!item) {
          this.internalStorageSell.set(date.valueOf(), payment)
        } else {
          item.power = item.power.plus(payment.power)
          item.price = item.price.plus(payment.price)
          item.total = item.total.plus(payment.total)
        }
      }
    })
    // gets upstream payments
    let upstream = await this.db.requests.getTrades(from)
    upstream = upstream.filter(payment => payment.getPayment().sender === this.account) // filter only where I pay
    upstream.forEach(trade => {
      const payment = trade.getPayment()
      const measurement = trade.getMeasurement()
      const date = this.intervalStart(measurement.datetime)
      const item = this.internalStorageBuy.get(date.valueOf())
      if (!item) {
        this.internalStorageBuy.set(date.valueOf(), new LightPayment(payment.token!, payment.sender, payment.receiver,
          measurement.delta, payment.price, date,
          PaymentState.off_chain))
      } else {
        item.power = item.power.plus(measurement.delta)
        item.price = item.price.plus(payment.price)
        item.total = item.total.plus(payment.value)
      }
    })

    // gets unpaid measurments
    let unpaidMeasurments = await this.db.requests.getUnpaidMeasurements()
    unpaidMeasurments = unpaidMeasurments.filter(value => value.datetime.valueOf() >= from.valueOf())
    const errors = this.problemController.getErrors(this.account)
    // Add fake payment for unpaid
    unpaidMeasurments.forEach(measurement => {
      const date = this.intervalStart(measurement.datetime)
      const error = errors.find(error => 'date' in error ? this.intervalStart(error.date).valueOf() === date.valueOf() : false)
      let state = PaymentState.no_response
      if (error) {
        switch (error.type) {
          case ErrorType.BuyChannelNotExist:
            state = PaymentState.no_channel
            break
          case ErrorType.BuyNotEnoughMoney:
            state = PaymentState.no_deposit
            break
        }
      }
      const item = this.internalStorageBuy.get(date.valueOf())
      if (!item) {
        this.internalStorageBuy.set(date.valueOf(), new LightPayment('', this.account,
          '', measurement.delta, new BigNumber(0), date, state))
      } else {
        item.power = item.power.plus(measurement.delta)
        item.price = item.price.div(2) // avg price
        item.state = state > item.state ? state : item.state
      }
    })
    this.cleanInternalStorages()
  }

  private async broadcastPayments (lightPayments: Array<ILightPayment>): Promise<void> {
    let response = PaymentsRoomResponseSerde.serialize({ values: lightPayments })
    log.debug('Emitting light payments as ', response.toJSON())
    log.debug('Emitting light payments as buffer', webproto.PaymentsRoomResponse.encode(response).finish())
    this.ioapp.of(WebServer.NAMESPACE).in(this.roomID).emit(this.roomID, webproto.PaymentsRoomResponse.encode(response).finish())
  }

  private static cleanStorage (storage: Map<number, LightPayment>, period: RoomPeriod) {
    const keys = Array.from(storage.keys())
    const from = ARoom.from(period)
    const toDelete = keys.filter(key => key < from.valueOf())
    toDelete.forEach(key => storage.delete(key))
  }

  private cleanInternalStorages () {
    PaymentsRoom.cleanStorage(this.internalStorageBuy, this.roomPeriod)
    PaymentsRoom.cleanStorage(this.internalStorageSell, this.roomPeriod)
    PaymentsRoom.cleanStorage(this.internalStorageWasted, this.roomPeriod)
  }

  private intervalStart (time: moment.Moment = moment().utc()): moment.Moment {
    return Utils.intervalStart(this.workTimeout, time)
  }

  private calculateWorkTimeout () {
    const now = moment().utc()
    const from = ARoom.from(this.roomPeriod)
    const diff = now.diff(from, 'ms')
    return diff / GRAPH_COLUMN_COUNT
  }
}
