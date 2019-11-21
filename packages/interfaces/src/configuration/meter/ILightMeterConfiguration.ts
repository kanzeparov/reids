import { webproto } from '../../proto'

export interface ILightMeterConfiguration {
  account: string
  ideaId?: string
}

export class LightMeterConfigurationSerde {
  static serialize (value: ILightMeterConfiguration) {
    return webproto.LightMeterConfiguration.create(value)
  }
  static deserialize (obj: any): ILightMeterConfiguration {
    return webproto.LightMeterConfiguration.fromObject(obj)
  }
}
