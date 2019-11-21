import { webproto, IWebError } from '../'
import { LightPaymentSerde } from '../../trades'

export interface IErrorRoomRequest {

}

export interface IErrorRoomResponse {
  add: Array<IWebError>
  remove: Array<IWebError>
  update: Array<IWebError>
}

export class ErrorRoomRequestSerde {
  static serialize (value: IErrorRoomRequest) {
    return webproto.ErrorRoomRequest.create({
      type: webproto.RoomType.Error
    })
  }
  static deserialize (obj: any): IErrorRoomRequest {
    return webproto.ErrorRoomRequest.fromObject(obj)
  }
}
