import * as io from 'socket.io'
import BigNumber from 'bignumber.js'
import {
  IBuyerListener,
  ITrade,
  IMachinomy,
  ISellerListener,
  WebRoomName,
  ILightPayment,
  IBalanceRoomResponse,
  IBalanceRoomRequest,
  BalanceRoomResponseSerde,
  webproto,
  protoEncode
} from '@onder/interfaces'
import ARoom from './ARoom'
import * as moment from 'moment'
import WebServer from '../WebServer'
import Logger from '../../Logger'

const log = new Logger('balance-room')

export default class BalanceRoom extends ARoom implements IBuyerListener, ISellerListener {
  roomID: string
  roomType = webproto.RoomType.Balance
  private readonly workTimeout: number
  private readonly account: string
  private machinomy: IMachinomy
  private lastNotify: moment.Moment
  private timeoutID?: NodeJS.Timer

  constructor (account: string, ioapp: io.Server, machinomy: IMachinomy, workTimeout: number) {
    super(ioapp)
    this.account = account
    this.machinomy = machinomy
    this.roomID = WebRoomName.Balance + '_' + this.account
    this.lastNotify = moment(1) // start epoch
    this.workTimeout = workTimeout
  }

  async join (socket: io.Socket, request: IBalanceRoomRequest): Promise<void> {
    this.realjoin(socket)
    const response = await this.updateResponse()
    this.ioapp.of(WebServer.NAMESPACE).in(this.roomID).emit(this.roomID, protoEncode(BalanceRoomResponseSerde.serialize(response)))
  }

  onBuy (trade: ITrade): Promise<void> {
    return this.broadcast()
  }

  onSell (payment: ILightPayment): Promise<void> {
    return this.broadcast()
  }

  private async updateResponse (): Promise<IBalanceRoomResponse> {
    const onchainBalance = await this.machinomy.onchainBalance()
    const offchainBalance = await this.machinomy.offchainBalance()
    this.lastNotify = moment().utc()
    return {
      balance_eth: onchainBalance,
      balance_channel: offchainBalance,
      owe: new BigNumber(0)
    }
  }

  private async broadcast (): Promise<void> {
    return this.whenConnected(async () => {
      const timeout = Math.abs(moment().utc().diff(this.lastNotify, 'ms'))
      if (timeout <= this.workTimeout) {
        if (this.timeoutID) {
          return
        }
        this.timeoutID = setTimeout(() => {
          return this.broadcast().catch((reason) => {
            log.error('Error onEvent in timeout', reason)
          })
        }, this.workTimeout)
        return
      }
      if (this.timeoutID) {
        clearTimeout(this.timeoutID)
        this.timeoutID = undefined
      }
      const response = await this.updateResponse()
      this.ioapp.of(WebServer.NAMESPACE).in(this.roomID).emit(this.roomID, protoEncode(BalanceRoomResponseSerde.serialize(response)))
    })
  }
}
