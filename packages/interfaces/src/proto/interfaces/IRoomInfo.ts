import { webproto } from '../'

export enum RoomPeriod {
  min10 = 'min10',
  day1 = 'day1',
  week1 = 'week1',
  month1 = 'month1',
  all = 'all'
}

export interface IRoomInfo {
  readonly roomID: string
  readonly roomType: webproto.RoomType
  readonly roomPeriod?: RoomPeriod
}

export class RoomInfoSerde {
  static serialize (value: IRoomInfo) {
    return webproto.RoomInfo.create({
      roomID: value.roomID,
      roomType: value.roomType,
      roomPeriod: value.roomPeriod ? value.roomPeriod : ''
    })
  }
  static deserialize (obj: any): IRoomInfo {
    const value = webproto.RoomInfo.fromObject(obj)
    return {
      roomID: value.roomID,
      roomType: value.roomType,
      roomPeriod: value.roomPeriod === '' ? undefined : value.roomPeriod as RoomPeriod
    }
  }
}
