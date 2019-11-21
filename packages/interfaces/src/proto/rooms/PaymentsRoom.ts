import { webproto } from '../'
import { ILightPayment, LightPaymentSerde } from '../../trades'

export interface IPaymentsRoomRequest {

}

export interface IPaymentsRoomResponse {
  values: Array<ILightPayment>
}

export class PaymentsRoomRequestSerde {
  static serialize (value: IPaymentsRoomRequest): webproto.PaymentsRoomRequest {
    return webproto.PaymentsRoomRequest.create({
      type: webproto.RoomType.Payments
    })
  }
  static deserialize (obj: any): IPaymentsRoomRequest {
    return webproto.PaymentsRoomRequest.fromObject(obj)
  }
}

export class PaymentsRoomResponseSerde {
  static serialize (value: IPaymentsRoomResponse): webproto.PaymentsRoomResponse {
    return webproto.PaymentsRoomResponse.create({
      type: webproto.RoomType.Payments,
      value: value.values.map(value => LightPaymentSerde.serialize(value))
    })
  }
  static deserialize (obj: any): IPaymentsRoomResponse {
    const value = webproto.PaymentsRoomResponse.fromObject(obj)
    return {
      values: value.value.map(value => LightPaymentSerde.deserialize(value))
    }
  }
}
