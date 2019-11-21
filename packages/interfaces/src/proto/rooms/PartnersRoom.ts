import { webproto } from '../'
import { ILightPartner, LightPartnerSerde } from '../../trades'

export interface IPartnersRoomRequest {

}

export interface IPartnersRoomResponse {
  values: Array<ILightPartner>
}

export class PartnersRoomRequestSerde {
  static serialize (value: IPartnersRoomRequest) {
    return webproto.PartnersRoomRequest.create({
      type: webproto.RoomType.Partners
    })
  }
  static deserialize (obj: any): IPartnersRoomRequest {
    return webproto.PartnersRoomRequest.fromObject(obj)
  }
}

export class PartnersRoomResponseSerde {
  static serialize (value: IPartnersRoomResponse) {
    return webproto.PartnersRoomResponse.create({
      type: webproto.RoomType.Partners,
      value: value.values.map(value => LightPartnerSerde.serialize(value))
    })
  }
  static deserialize (obj: any): IPartnersRoomResponse {
    const value = webproto.PartnersRoomResponse.fromObject(obj)
    return {
      values: value.value.map(value => LightPartnerSerde.deserialize(value))
    }
  }
}
