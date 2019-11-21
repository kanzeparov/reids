import { webproto, protoEncode } from '@onder/interfaces'

export async function processDeleteErrorEvent (): Promise<Uint8Array> {
  // TODO: implement
  return protoEncode(webproto.DeleteErrorEventResponse.create())
}
