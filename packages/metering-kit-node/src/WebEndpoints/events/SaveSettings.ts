import { webproto, protoEncode } from '@onder/interfaces'

export async function processSaveSettingsEvent (): Promise<Uint8Array> {
  return protoEncode(webproto.SaveSettingsEventResponse.create())
}
