import { webproto, protoEncode } from '@onder/interfaces'

export async function processGetSettingsEvent (): Promise<Uint8Array> {
  return protoEncode(webproto.GetSettingsEventResponse.create({
    name: '',
    email: '',
    phone: '',
    address: '',
    timezone: '',
    language: '',
    sendStatistics: true,
    upstreamId: '',
    sellPrice: '0',
    borrowEnergy: true
  }))
}
