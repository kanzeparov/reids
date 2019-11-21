import { IMeterConfiguration, WalletTypes, IProxySettings, IResolverConfiguration } from './'
import { BigNumber } from 'bignumber.js'
import { webproto } from '../proto'
import { ILightMeterConfiguration, LightMeterConfigurationSerde } from './meter'

export interface ILightConfiguration {
  readonly workTimeout: number
  readonly upstreamAddress?: string
  readonly isSeller: boolean
  readonly price: BigNumber
  readonly allowSendStatistic: boolean
  readonly meterConfiguration: Array<ILightMeterConfiguration>
}
export interface IConfiguration extends ILightConfiguration,
                                        IResolverConfiguration {
  getEthereumApi (): string
  getProblemUri (): string
  getOwnerKey (): string | undefined
  getDatabaseUrl (): string
  getWebInterfacePort (): number
  setSeller (): void
  meterConfiguration: Array<IMeterConfiguration>
  getWalletType (): WalletTypes
  reset? (): void
  getProxySettings (): IProxySettings
}

export class LightConfigurationSerde {
  static serialize (value: ILightConfiguration) {
    return webproto.LightConfiguration.create({
      workTimeout: value.workTimeout,
      upstreamAddress: value.upstreamAddress ? value.upstreamAddress : '',
      isSeller: value.isSeller,
      price: value.price.toString(),
      allowSendStatistic: value.allowSendStatistic,
      meterConfiguration: value.meterConfiguration.map(meter => LightMeterConfigurationSerde.serialize(meter))
    })
  }
  static deserialize (obj: any): ILightConfiguration {
    const value = webproto.LightConfiguration.fromObject(obj)
    return {
      workTimeout: value.workTimeout,
      upstreamAddress: value.upstreamAddress === '' ? undefined : value.upstreamAddress,
      isSeller: value.isSeller,
      price: new BigNumber(value.price),
      allowSendStatistic: value.allowSendStatistic,
      meterConfiguration: value.meterConfiguration.map(meter => LightMeterConfigurationSerde.deserialize(meter))
    }
  }
}
