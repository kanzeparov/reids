import { webproto, LightConfigurationSerde, protoEncode } from '@onder/interfaces'
import { BigNumber } from 'bignumber.js'
import VirtualMeterContainer from '../../VirtualMeterContainer'

export async function processConfigurationEvent (quantum: number, upstreamAccount: string, isSeller: boolean, defaultPrice: BigNumber, allowSendStatistic: boolean, meters: VirtualMeterContainer): Promise<Uint8Array> {
  let meterConfiguration = meters.accounts().map(account => {
    return { account: account.toString() }
  })
  let configuration = {
    workTimeout: quantum,
    upstreamAddress: upstreamAccount.toString(),
    isSeller: isSeller,
    price: defaultPrice,
    allowSendStatistic: allowSendStatistic,
    meterConfiguration: meterConfiguration
  }

  return protoEncode(webproto.ConfigurationEventResponse.create({
    configuration: LightConfigurationSerde.serialize(configuration)
  }))
}
