import { webproto, RoomInfoSerde, protoEncode } from '@onder/interfaces'
import RoomStorage from '../rooms/RoomStorage'

export async function processRoomsEvent (): Promise<Uint8Array> {
  const rooms = RoomStorage.getInstance().getAllRooms()
  return protoEncode(webproto.RoomsEventResponse.create({
    rooms: rooms.map(room => RoomInfoSerde.serialize(room))
  }))
}
