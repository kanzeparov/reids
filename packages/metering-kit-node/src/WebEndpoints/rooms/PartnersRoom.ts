import {
  IMeter,
  IMeterReaderCallback,
  IMeterValue,
  IPartnersRoomRequest,
  IPartnersRoomResponse,
  ITrade,
  RoomPeriod,
  WebRoomName,
  ILightPayment,
  PartnersRoomResponseSerde,
  webproto,
  protoEncode
} from '@onder/interfaces'
import * as moment from 'moment'
import * as io from 'socket.io'
import WebServer from '../WebServer'
import ARoom from './ARoom'
import NodeDatabase from '../../nodeDatabase/nodeDatabase'
import Logger from '../../Logger'

const log = new Logger('partners-room')

export default class PartnersRoom extends ARoom implements IMeterReaderCallback {
  readonly roomID: string
  readonly roomType = webproto.RoomType.Partners
  readonly roomPeriod: RoomPeriod

  private readonly account: string
  private db: NodeDatabase
  private lastNotify: moment.Moment
  private readonly workTimeout: number
  private timeoutID?: NodeJS.Timer

  constructor (account: string, db: NodeDatabase, ioapp: io.Server, workTimeout: number, period: RoomPeriod) {
    super(ioapp)
    this.account = account
    this.db = db
    this.roomID = WebRoomName.Partners + '_' + this.account + '_' + period
    this.roomPeriod = period
    this.lastNotify = moment(1) // start epoch
    this.workTimeout = workTimeout
  }

  async join (socket: io.Socket, request: IPartnersRoomRequest): Promise<void> {
    this.realjoin(socket)
    await this.updateResponse()
  }

  onBuy (trade: ITrade): Promise<void> {
    return this.onEvent()
  }

  onSell (payment: ILightPayment): Promise<void> {
    return this.onEvent()
  }

  onReadValue (meter: IMeter, value: IMeterValue): Promise<void> {
    return this.onEvent()
  }

  private async onEvent (): Promise<void> {
    await this.whenConnected(async () => {
      const timeout = Math.abs(moment().utc().diff(this.lastNotify, 'ms'))
      if (timeout <= this.workTimeout) {
        if (this.timeoutID) {
          return
        }
        this.timeoutID = setTimeout(() => {
          return this.onEvent().catch((reason) => {
            log.error('Error onEvent in timeout', reason)
          })
        }, this.workTimeout)
        return
      }
      if (this.timeoutID) {
        clearTimeout(this.timeoutID)
        this.timeoutID = undefined
      }

      if (!this.ioapp.clients().adapter.rooms) {
        return
      }

      const connectionCount = await this.getConnectionCount()

      if (connectionCount === 0) {
        return
      }

      const response = await this.updateResponse()

      this.ioapp.of(WebServer.NAMESPACE).in(this.roomID).emit(this.roomID, protoEncode(PartnersRoomResponseSerde.serialize(response)))
    })
  }

  private async updateResponse (): Promise<IPartnersRoomResponse> {
    this.lastNotify = moment().utc()
    const values = await this.db.requests.getInteractionWithCounterpart(this.account, ARoom.from(this.roomPeriod))
    return { values }
  }

}
