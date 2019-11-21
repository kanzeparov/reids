import { LightPayment } from '@onder/common'
import {
  IBuyerListener,
  ISellerListener,
  ITrade,
  WebRoomName,
  ILightPayment,
  PaymentState,
  ErrorType,
  ITransactionsRoomResponse,
  ITransactionsRoomRequest,
  TransactionsRoomResponseSerde,
  webproto,
  protoEncode
} from '@onder/interfaces'
import * as io from 'socket.io'
import WebServer from '../WebServer'
import ARoom from './ARoom'
import ProblemController from '../../ProblemController'
import NodeDatabase from '../../nodeDatabase/nodeDatabase'

const TRANSACTIONS_LIMIT = 30

export default class TransactionsRoom extends ARoom implements IBuyerListener, ISellerListener {
  roomID: string
  roomType = webproto.RoomType.Payments
  private readonly account: string
  private db: NodeDatabase
  private problemController: ProblemController

  constructor (account: string, db: NodeDatabase, webServer: WebServer,
               problemController: ProblemController) {
    super(webServer.ioapp)
    this.account = account
    this.db = db
    this.problemController = problemController
    this.roomID = `${WebRoomName.Transactions}_${this.account}`
  }

  async join (socket: io.Socket, request: ITransactionsRoomRequest): Promise<void> {
    this.realjoin(socket)

    const response: ITransactionsRoomResponse = { values: await this.createInitialPayments() }
    socket.emit(this.roomID, protoEncode(TransactionsRoomResponseSerde.serialize(response)))
  }

  async onBuy (trade: ITrade): Promise<void> {
    await this.whenConnected(async () => {
      const payment = trade.getPayment()
      const measurement = trade.getMeasurement()
      const item = new LightPayment(payment.token ? payment.token : '', payment.sender, payment.receiver, measurement.delta,
        payment.price, measurement.datetime, PaymentState.off_chain)
      await this.broadcast(item)
    })
  }

  async onSell (payment: ILightPayment): Promise<void> {
    await this.whenConnected(async () => {
      await this.broadcast(payment)
    })
  }

  private async createInitialPayments (): Promise<LightPayment[]> {
    const errors = this.problemController.getErrors(this.account)

    // Downstream payments
    const dPayments = await this.db.requests.getPaymentsLimited(TRANSACTIONS_LIMIT)
    const downstreamPayments = dPayments.map(payment => {
      let state = PaymentState.off_chain
      // TODO: add check for on_chain
      return new LightPayment(payment.token ? payment.token : '', payment.sender, payment.receiver, payment.power,
        payment.price, payment.datetime, state)
    })

    const uPayments = await this.db.requests.getTradesLimited(TRANSACTIONS_LIMIT)
    const upstreamPayments = uPayments.map(trade => {
      let state = PaymentState.off_chain
      const payment = trade.getPayment()
      const measurement = trade.getMeasurement()
      // TODO: add check for on_chain
      const error = errors.find(error => {
        if (!('date' in error)) {
          return false
        }
        return error.date.valueOf() === measurement.datetime.valueOf()
      })
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
      return new LightPayment(payment.token ? payment.token : '', payment.sender, payment.receiver, measurement.delta,
        payment.price, measurement.datetime, state)
    })
    return upstreamPayments.concat(downstreamPayments).sort((a, b) => {
      return b.datetime.valueOf() - a.datetime.valueOf()
    }).slice(0, TRANSACTIONS_LIMIT)
  }

  private async broadcast (transaction: ILightPayment): Promise<void> {
    const response = TransactionsRoomResponseSerde.serialize({ values: [transaction] })
    this.ioapp.of(WebServer.NAMESPACE).in(this.roomID).emit(this.roomID, protoEncode(response))
  }
}
