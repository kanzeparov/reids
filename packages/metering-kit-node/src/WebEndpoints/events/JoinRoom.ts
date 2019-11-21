import { webproto, protoEncode, protoDecode } from '@onder/interfaces'
import * as io from 'socket.io'
import RoomStorage from '../rooms/RoomStorage'
import { ErrorFactory } from '@onder/common'
import WebServer from '../WebServer'
import PartnerRoom from '../rooms/PartnerRoom'
import Logger from '../../Logger'
import VirtualMeterContainer from '../../VirtualMeterContainer'

const log = new Logger('process-join-room-event')

function dynamicPartner (roomID: string, webServer: WebServer, meters: VirtualMeterContainer, upstreamAccount: string) {
  const room = PartnerRoom.createByName(roomID, webServer, meters, upstreamAccount)
  if (!room) {
    return
  }
  RoomStorage.getInstance().addRoom(room)
  return room
}

const dynamicRoomCreator = [
  dynamicPartner
]

export async function processJoinRoomEvent (webServer: WebServer, socket: io.Socket, data: any, meters: VirtualMeterContainer, upstreamAccount: string): Promise<Uint8Array> {
  let request: webproto.IJoinRoomEventRequest
  try {
    request = protoDecode(webproto.JoinRoomEventRequest, data)
  } catch (err) {
    log.error(err)
    const error = await ErrorFactory.createInternalErrorError()
    throw error
  }
  const allRooms = RoomStorage.getInstance().getAllRooms()
  let room = allRooms.find(room => request.roomID === room.roomID)

  if (!room) {
    for (let i = 0; i < dynamicRoomCreator.length; ++i) {
      room = dynamicRoomCreator[i](request.roomID, webServer, meters, upstreamAccount)
      if (room) {
        break
      }
    }
    if (!room) {
      const error = await ErrorFactory.createRoomDontExistError(request.roomID)
      throw error
    }
  }

  try {
    let roomRequest: any = undefined
    switch (request.type) {
      case webproto.RoomType.Partner:
        roomRequest = protoDecode(webproto.PartnerRoomRequest, request.roomEventRequest)
        break
      case webproto.RoomType.Payments:
        roomRequest = protoDecode(webproto.PaymentsRoomRequest, request.roomEventRequest)
        break
      case webproto.RoomType.Partners:
        roomRequest = protoDecode(webproto.PartnersRoomRequest, request.roomEventRequest)
        break
      case webproto.RoomType.Measurements:
        roomRequest = protoDecode(webproto.MeasurementsRoomRequest, request.roomEventRequest)
        break
      case webproto.RoomType.Error:
        roomRequest = protoDecode(webproto.ErrorRoomRequest, request.roomEventRequest)
        break
      case webproto.RoomType.Balance:
        roomRequest = protoDecode(webproto.BalanceRoomRequest, request.roomEventRequest)
        break
      case webproto.RoomType.Transactions:
        roomRequest = protoDecode(webproto.TransactionsRoomRequest, request.roomEventRequest)
        break
      default:
        throw new Error('Room type not supported')
    }
    await room.join(socket, roomRequest)
    return protoEncode(webproto.JoinRoomEventResponse.create())
  } catch (err) {
    log.error(err)
    const error = await ErrorFactory.createInternalErrorError()
    throw error
  }
}
