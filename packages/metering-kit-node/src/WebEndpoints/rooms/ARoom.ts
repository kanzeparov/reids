import * as io from 'socket.io'
import { RoomPeriod, webproto } from '@onder/interfaces'
import IRoom from '../IRoom'
import WebServer from '../WebServer'
import * as moment from 'moment'
import Logger from '../../Logger'

const log = new Logger('aroom')

export default abstract class ARoom implements IRoom {
  abstract roomID: string
  abstract roomType: webproto.RoomType
  protected ioapp: io.Server

  constructor (ioapp: io.Server) {
    this.ioapp = ioapp
  }

  protected static from (period: RoomPeriod): moment.Moment {
    const now = moment().utc()
    switch (period) {
      case RoomPeriod.min10:
        return now.subtract(10, 'minutes')
      case RoomPeriod.day1:
        return now.subtract(1, 'days')
      case RoomPeriod.week1:
        return now.subtract(1, 'weeks')
      case RoomPeriod.month1:
        return now.subtract(1, 'months')
      default:
        log.error(`Unsupported period ${period}, use 10 minutes by default`)
        return now.subtract(10, 'minutes')
    }
  }

  abstract join (socket: io.Socket, request: any): Promise<void>

  leave (socket: io.Socket): Promise<void> {
    socket.leave(this.roomID)
    return Promise.resolve()
  }

  protected realjoin (socket: io.Socket) {
    socket.join(this.roomID, (err?: any) => {
      if (err) {
        log.error("Can't join in room", this.roomID, err)
      }
    })
  }

  protected getConnectionCount (): Promise<number> {
    return new Promise((resolve, reject) => {
      this.ioapp.of(WebServer.NAMESPACE).in(this.roomID).clients((error: any, data: any) => {
        if (error) {
          return reject(error)
        }
        return resolve(data && data.length || 0)
      })
    })
  }

  protected async whenConnected <A> (fn: () => Promise<A>): Promise<void> {
    const connectionsCount = await this.getConnectionCount()
    if (connectionsCount > 0) {
      await fn()
    }
  }
}
