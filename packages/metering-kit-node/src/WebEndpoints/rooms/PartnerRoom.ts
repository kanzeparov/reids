import Logger from '@machinomy/logger'
import {IMeterReader, LightPayment} from '@onder/common'
import {
  IBuyerListener,
  ILightPayment,
  IMeter,
  IMeterReaderCallback,
  IMeterValue,
  IPartnerRoomRequest,
  IPartnerRoomResponse,
  ISellerListener,
  ITrade,
  PartnerRoomResponseSerde,
  PaymentState,
  protoEncode,
  RoomPeriod,
  webproto,
  WebRoomName
} from '@onder/interfaces'
import * as moment from 'moment'
import * as io from 'socket.io'
import WebServer from '../WebServer'
import ARoom from './ARoom'
import ProblemController from '../../ProblemController'
import {BigNumber} from 'bignumber.js'
import RoomStorage from './RoomStorage'
import Buyer from '../../Buyer'
import Seller from '../../Seller'
import NodeDatabase from '../../typeOrmDatabase/nodeDatabase'
import VirtualMeterContainer from '../../VirtualMeterContainer'

const log = new Logger('onder-metering-kit-node-partnerroom')

export default class PartnerRoom extends ARoom implements IMeterReaderCallback, IBuyerListener, ISellerListener {
  roomID: string
  roomType = webproto.RoomType.Partner
  roomPeriod: RoomPeriod
  private readonly account: string
  private db: NodeDatabase
  private partner: string
  private problemController: ProblemController
  private webServer: WebServer
  private readonly buyer?: Buyer
  private readonly seller?: Seller

  constructor (account: string, db: NodeDatabase, webServer: WebServer, period: RoomPeriod, partner: string,
               problemController: ProblemController, buyer?: Buyer, seller?: Seller) {
    super(webServer.ioapp)
    this.buyer = buyer
    this.seller = seller
    this.account = account
    this.db = db
    this.partner = partner
    this.problemController = problemController
    this.roomID = `${WebRoomName.Partner}_${this.account}_${this.partner}_${period}`
    this.roomPeriod = period
    this.webServer = webServer
  }

  static createByName (roomID: string, webServer: WebServer, meters: VirtualMeterContainer, upstreamAccount: string): PartnerRoom | undefined {
    const parts = roomID.split('_')
    if (parts.length < 4) {
      return
    }
    if (parts[0] !== WebRoomName.Partner) {
      return
    }
    const account = parts[1]
    const partner = parts[2]

    const meter = meters.get(account)
    if (!meter) {
      return
    }
    const db = meter.database
    const reader = meter.reader
    const buyer = meter.buyer
    const seller = meter.seller

    const room = new PartnerRoom(account, db, webServer, parts[3] as RoomPeriod, partner, webServer.problemController)
    reader.on(IMeterReader.Event.Read, async payload => {
      await room.onReadValue(payload.meter, payload.value)
    })
    if (buyer && upstreamAccount === partner) {
      buyer.on(Buyer.Event.BUY, room.onBuy.bind(room))
    }
    if (seller) {
      seller.on(Seller.Event.SELL, room.onSell.bind(room))
    }
    webServer.addMeterReaderRoom(account, room)
    return room
  }

  join (socket: io.Socket, request: IPartnerRoomRequest): Promise<void> {
    this.realjoin(socket)
    return this.joinResponse().then(response => {
      socket.emit(this.roomID, protoEncode(PartnerRoomResponseSerde.serialize(response)))
      return
    })
  }

  async onBuy (trade: ITrade): Promise<void> {
    await this.whenConnected(async () => {
      if (trade.getPayment().receiver !== this.partner) {
        return
      }
      let tmpFrom = ARoom.from(this.roomPeriod)
      const from = tmpFrom ? tmpFrom : moment().subtract(10, 'minutes').utc()
      if (trade.getMeasurement().datetime < from) {
        return
      }
      const payment = trade.getPayment()
      return this.broadcast(new LightPayment(payment.token ? payment.token : '', payment.sender, payment.receiver, trade.getMeasurement().delta,
        payment.price, trade.getMeasurement().datetime, PaymentState.off_chain))
    })
  }

  async onSell (payment: ILightPayment): Promise<void> {
    await this.whenConnected(async () => {
      if (payment.sender !== this.partner) {
        return
      }
      let tmpFrom = ARoom.from(this.roomPeriod)
      const from = tmpFrom ? tmpFrom : moment().subtract(10, 'minutes').utc()
      if (payment.datetime < from) {
        return
      }
      return this.broadcast(payment)
    })
  }

  async onReadValue (meter: IMeter, value: IMeterValue): Promise<void> {
    await this.whenConnected(async () => {
      if (this.partner !== this.webServer.upstreamAccount) {
        return
      }
      let tmpFrom = ARoom.from(this.roomPeriod)
      const from = tmpFrom ? tmpFrom : moment().subtract(10, 'minutes').utc()
      if (value.datetime < from) {
        return
      }
      return this.broadcast(new LightPayment('', this.account, this.partner, value.delta,
        new BigNumber(0), value.datetime, PaymentState.no_response))
    })
  }

  // called for unsubscribe from all notification services
  private destroyRoom () {
    if (this.buyer) {
      this.buyer.removeListener(Buyer.Event.BUY, this.onBuy.bind(this))
    }
    if (this.seller) {
      this.seller.removeListener(Seller.Event.SELL, this.onSell.bind(this))
    }
    this.webServer.removeMeterReaderRoom(this.account, this)
    RoomStorage.getInstance().removeRoom(this)
  }

  private async broadcast (event: ILightPayment): Promise<void> {
    try {
      if (!this.ioapp.clients().adapter.rooms) {
        this.destroyRoom()
        return
      }

      const connectionCount = await this.getConnectionCount()

      if (connectionCount === 0) {
        return
      }

      const response: IPartnerRoomResponse = {
        values: [ event ]
      }

      this.ioapp.of(WebServer.NAMESPACE).in(this.roomID).emit(this.roomID, protoEncode(PartnerRoomResponseSerde.serialize(response)))
      return

    } catch (e) {
      log.error('cannot response', e)
    }

  }

  private async joinResponse (): Promise<IPartnerRoomResponse> {
    // gets downstream payments
    /*let tmpFrom = ARoom.from(this.roomPeriod)
    const from = tmpFrom ? tmpFrom : moment().subtract(10, 'minutes').utc()
    let downstream = await this.db.requests.getPayments(from)
    // gets upstream payments
    let upstream = await this.db.requests.getTrades(from)
    upstream = upstream.filter(payment => payment.getPayment().sender === this.account) // filter only where I pay
    const upstreamPrepared = upstream.map(value => {
      const payment = value.getPayment()
      return new LightPayment(payment.token!, payment.sender, payment.receiver,
                              value.getMeasurement().delta, payment.price, value.getMeasurement().datetime,
                              PaymentState.off_chain) // TODO: check state of payment may by on chain
    })
    let result = downstream.concat(upstreamPrepared)
    if (this.partner === this.webServer.upstreamAccount) {
      // gets unpaid measurments
      let unpaidMeasurments = await this.db.requests.getUnpaidMeasurements()
      unpaidMeasurments = unpaidMeasurments.filter(value => value.datetime.valueOf() >= from.valueOf())
      const errors = this.problemController.getErrors(this.account)
      let unpaid = unpaidMeasurments.map(value => {
        const error = errors.find(error => 'date' in error ? error.date.valueOf() === value.datetime.valueOf() : false)
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
        return new LightPayment('', this.account,
          this.partner, value.delta, new BigNumber(0), value.datetime, state)
      })
      result = result.concat(unpaid)
    }
    result.sort((a, b) => a.datetime.valueOf() - b.datetime.valueOf())
    return {
      values: result
    }*/
    return { values: [] }
  }

}
