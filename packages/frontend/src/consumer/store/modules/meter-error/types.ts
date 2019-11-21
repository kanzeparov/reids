import { webproto, WebRoomName } from '@onder/interfaces'

export interface IMeterErrorState {
  data: IMeterErrorData
  meta: IMeterErrorMeta
}

export interface IMeterErrorData {
  /* Used in pivot table */
  errors: Array<IMeterError>
}

export interface IMeterErrorMeta {
  roomName: WebRoomName
  roomType: webproto.RoomType
  roomRequest: webproto.PartnersRoomRequest
}

export interface IMeterError {
  type: string
  date: string
  time: string
  text: string
  isFixed: boolean
  fixedDate: string
  fixedTime: string
  id: string
}
