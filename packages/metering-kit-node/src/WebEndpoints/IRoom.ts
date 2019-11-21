import * as io from 'socket.io'
import { IRoomInfo } from '@onder/interfaces'

export default interface IRoom extends IRoomInfo {
  join (socket: io.Socket, request: any): Promise<void>
  leave (socket: io.Socket): Promise<void>
}
