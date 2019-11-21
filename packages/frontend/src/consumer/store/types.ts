import { webproto, WebRoomName, IRoomInfo, IWebError } from '@onder/interfaces'

export interface RootState {
  loaderActive: boolean
  menuState: boolean
  serverTimeout: number
  // errors: Array<IWebError>
}

export interface IRoomMeta {
  roomName: WebRoomName
  roomType: webproto.RoomType
  roomRequest: webproto.PartnersRoomRequest
}
