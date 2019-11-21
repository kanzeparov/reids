import { webproto, protoEncode, protoDecode } from '@onder/interfaces'
import * as io from 'socket.io'
import RoomStorage from '../rooms/RoomStorage'
import IRoom from '../IRoom'
import { ErrorFactory } from '@onder/common'
import Logger from '../../Logger'

const log = new Logger('process-exit-room-event')

export async function processExitRoomEvent (socket: io.Socket, data: any): Promise<Uint8Array> {
  let request: webproto.IExitRoomEventRequest
  try {
    request = protoDecode(webproto.ExitRoomEventRequest, data)
  } catch (err) {
    log.error(err)
    const error = await ErrorFactory.createInternalErrorError()
    throw error
  }
  const room = RoomStorage.getInstance().getAllRooms().find((room: IRoom) => {
    return request.roomID === room.roomID
  })
  if (!room) {
    const error = await ErrorFactory.createRoomDontExistError(request.roomID)
    throw error
  }
  try {
    await room.leave(socket)
    return protoEncode(webproto.ExitRoomEventResponse.create())
  } catch (err) {
    log.error(err)
    const error = await ErrorFactory.createInternalErrorError()
    throw error
  }
}
