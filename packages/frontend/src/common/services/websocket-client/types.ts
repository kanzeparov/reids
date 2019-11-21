import { webproto, WebRoomName } from '@onder/interfaces'

export declare type IRoomRequest =
  webproto.PartnerRoomRequest |
  webproto.PaymentsRoomRequest |
  webproto.PartnersRoomRequest |
  webproto.BalanceRoomRequest |
  webproto.MeasurementsRoomRequest |
  webproto.ErrorRoomRequest

export interface IRoom {
  roomId: string
  roomName: WebRoomName
  roomType: webproto.RoomType
  roomRequest: IRoomRequest
}
