import { webproto, protoEncode } from '@onder/interfaces'
import * as io from 'socket.io'

export async function processExitAllRoomsEvent (socket: io.Socket): Promise<Uint8Array> {
  socket.leaveAll()
  return protoEncode(webproto.ExitAllRoomsEventResponse.create())
}
