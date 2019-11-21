import {
  WebRoomName,
  WebEventName,
  webproto,
  protoEncode,
  protoDecode,
} from '@onder/interfaces'

import { IRoom } from './types'

export default class ProtoHelpers {
  static joinRoomRequest ({ roomId, roomType, roomRequest }: IRoom): any {
    return protoEncode(webproto.JoinRoomEventRequest.create({
      roomID: roomId,
      type: roomType,
      roomEventRequest: protoEncode(roomRequest),
    }))
  }

  static exitRoomRequest ({ roomId }: IRoom): any {
    return protoEncode(webproto.ExitRoomEventRequest.create({
      roomID: roomId,
    }))
  }

  static decodeRoomResponse (name: WebRoomName, response: any) {
    if (!(name in webproto.RoomType)) {
      throw new Error('Unsupported room type')
    }

    switch (name) {
      case WebRoomName.Partners:
        return protoDecode(webproto.PartnersRoomResponse, response)
        break
      case WebRoomName.Balance:
        return protoDecode(webproto.BalanceRoomResponse, response)
        break
      case WebRoomName.Measurements:
        return protoDecode(webproto.MeasurementsRoomResponse, response)
        break
      case WebRoomName.Errors:
        return protoDecode(webproto.ErrorRoomResponse, response)
        break
      case WebRoomName.Partner:
        return protoDecode(webproto.PartnerRoomResponse, response)
        break
      case WebRoomName.Payments:
        return protoDecode(webproto.PaymentsRoomResponse, response)
        break
      case WebRoomName.Transactions:
        return protoDecode(webproto.TransactionsRoomResponse, response)
        break
      default:
        throw new Error('Unknown room response type')
    }
  }

  static decodeEventResponse (name: WebEventName, response: any) {
    switch (name) {
      case WebEventName.JoinRoom:
        return protoDecode(webproto.JoinRoomEventResponse, response)
        break
      case WebEventName.ExitRoom:
        return protoDecode(webproto.ExitRoomEventResponse, response)
        break
      case WebEventName.ExitAllRooms:
        return protoDecode(webproto.ExitAllRoomsEventResponse, response)
        break
      case WebEventName.GetSettings:
        return protoDecode(webproto.GetSettingsEventResponse, response)
        break
      case WebEventName.SaveSettings:
        return protoDecode(webproto.SaveSettingsEventResponse, response)
        break
      case WebEventName.Configuration:
        return protoDecode(webproto.ConfigurationEventResponse, response)
        break
      case WebEventName.Rooms:
        return protoDecode(webproto.RoomsEventResponse, response)
        break
      case WebEventName.DeleteError:
        return protoDecode(webproto.DeleteErrorEventResponse, response)
        break
      default:
        throw new Error('Unknown event response type')
    }
  }
}
