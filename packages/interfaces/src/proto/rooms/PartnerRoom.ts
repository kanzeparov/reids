import { webproto } from '../'
import { ILightPayment, LightPaymentSerde } from '../../trades'

export interface IPartnerRoomRequest {

}

export interface IPartnerRoomResponse {
  values: Array<ILightPayment>
}

export class PartnerRoomRequestSerde {
  static serialize (value: IPartnerRoomRequest) {
    return webproto.PartnerRoomRequest.create({
      type: webproto.RoomType.Partner
    })
  }
  static deserialize (obj: any): IPartnerRoomRequest {
    return webproto.PartnerRoomRequest.fromObject(obj)
  }
}

export class PartnerRoomResponseSerde {
  static serialize (value: IPartnerRoomResponse) {
    return webproto.PartnerRoomResponse.create({
      type: webproto.RoomType.Partner,
      value: value.values.map(value => LightPaymentSerde.serialize(value))
    })
  }
  static deserialize (obj: any): IPartnerRoomResponse {
    const value = webproto.PartnerRoomResponse.fromObject(obj)
    return {
      values: value.value.map(value => LightPaymentSerde.deserialize(value))
    }
  }
}
