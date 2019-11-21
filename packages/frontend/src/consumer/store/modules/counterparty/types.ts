import { webproto, WebRoomName } from '@onder/interfaces'

export interface ICounterpartyState {
  data: ICounterpartyData
  meta: ICounterpartyMeta
}

export interface ICounterpartyData {
  /* Used in pivot table */
  counterparties: Array<ICounterparty>
}

export interface ICounterpartyMeta {
  roomName: WebRoomName
  roomType: webproto.RoomType
  roomRequest: webproto.PartnersRoomRequest
}

export interface ICounterparty {
  account: string
  shortAccount: string
  avatar: string
  buysPower: string
  buysTotalPrice: string
  sellsPower: string
  sellsTotalPrice: string
  der: string
  lastUpdate: string
}

export interface ICounterpartyDecorator {
  account: string
  shortAccount: string
  avatar: string
  totalPower: string
  totalPrice: string
  der: string
  lastUpdate: string
}
