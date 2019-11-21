import { webproto } from '../'
import { ILightPayment, LightPaymentSerde } from '../../trades'

export interface ITransactionsRoomRequest {

}

export interface ITransactionsRoomResponse {
  values: Array<ILightPayment>
}

export class TransactionsRoomRequestSerde {
  static serialize (value: ITransactionsRoomRequest) {
    return webproto.TransactionsRoomRequest.create({
      type: webproto.RoomType.Transactions
    })
  }
  static deserialize (obj: any): ITransactionsRoomRequest {
    return webproto.TransactionsRoomRequest.fromObject(obj)
  }
}

export class TransactionsRoomResponseSerde {
  static serialize (value: ITransactionsRoomResponse) {
    return webproto.TransactionsRoomResponse.create({
      type: webproto.RoomType.Transactions,
      value: value.values.map(value => LightPaymentSerde.serialize(value))
    })
  }
  static deserialize (obj: any): ITransactionsRoomResponse {
    const value = webproto.TransactionsRoomResponse.fromObject(obj)
    return {
      values: value.value.map(value => LightPaymentSerde.deserialize(value))
    }
  }
}
