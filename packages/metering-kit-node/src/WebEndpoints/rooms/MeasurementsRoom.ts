import * as io from 'socket.io'
import {
  IMeterReaderCallback,
  IMeter,
  IMeterValue,
  WebRoomName,
  RoomPeriod,
  IMeasurementsRoomRequest,
  MeasurementsRoomResponseSerde,
  webproto,
  protoEncode
} from '@onder/interfaces'
import ARoom from './ARoom'
import WebServer from '../WebServer'
import Logger from '../../Logger'
import NodeDatabase from '../../nodeDatabase/nodeDatabase'

const log = new Logger('measurements-room')

export default class MeasurementsRoom extends ARoom implements IMeterReaderCallback {
  roomID: string
  roomType = webproto.RoomType.Measurements
  roomPeriod: RoomPeriod
  private readonly account: string
  private db: NodeDatabase

  constructor (account: string, db: NodeDatabase, ioapp: io.Server, period: RoomPeriod) {
    super(ioapp)
    this.account = account
    this.db = db
    this.roomPeriod = period
    this.roomID = WebRoomName.Measurements + '_' + this.account + '_' + this.roomPeriod
  }

  async join (socket: io.Socket, request: IMeasurementsRoomRequest): Promise<void> {
    const from = ARoom.from(this.roomPeriod)
    const values = await this.db.requests.getMeasurements(from)
    this.realjoin(socket)
    const response = MeasurementsRoomResponseSerde.serialize({ values })
    this.ioapp.of(WebServer.NAMESPACE).to(this.roomID).emit(this.roomID, protoEncode(response))
    log.info(`Joined room ${this.roomID}`)
  }

  async onReadValue (meter: IMeter, value: IMeterValue): Promise<void> {
    await this.whenConnected(async () => {
      const intervalStart = ARoom.from(this.roomPeriod)
      const isTimely = intervalStart <= value.datetime
      if (isTimely) {
        const response = MeasurementsRoomResponseSerde.serialize({ values: [value] })
        this.ioapp.of(WebServer.NAMESPACE).to(this.roomID).emit(this.roomID, protoEncode(response))
        log.info(`Read value ${JSON.stringify(value)} to room ${this.roomID}`)
      } else {
        log.info(`Value ${JSON.stringify(value)} is not suitable for room ${this.roomID}`)
      }
    })
  }
}
