import { ILightMeterValue, LightMeterValueSerde } from '../../meters'
import { webproto } from '../'

export interface IMeasurementsRoomRequest {

}

export interface IMeasurementsRoomResponse {
  values: ILightMeterValue[]
}

export class MeasurementsRoomRequestSerde {
  static serialize (value: IMeasurementsRoomRequest) {
    return webproto.MeasurementsRoomRequest.create({
      type: webproto.RoomType.Measurements
    })
  }
  static deserialize (obj: any): IMeasurementsRoomRequest {
    return webproto.MeasurementsRoomRequest.fromObject(obj)
  }
}

export class MeasurementsRoomResponseSerde {
  static serialize (value: IMeasurementsRoomResponse) {
    return webproto.MeasurementsRoomResponse.create({
      type: webproto.RoomType.Measurements,
      value: value.values.map(value => LightMeterValueSerde.serialize(value))
    })
  }
  static deserialize (obj: any): IMeasurementsRoomResponse {
    const value = webproto.MeasurementsRoomResponse.fromObject(obj)
    return {
      values: value.value.map(value => LightMeterValueSerde.deserialize(value))
    }
  }
}
