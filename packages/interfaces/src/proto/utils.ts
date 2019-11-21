import { Writer } from 'protobufjs'

export function decodeHelper (proto: any): Uint8Array {
  if (proto instanceof Uint8Array) {
    return proto
  }
  if (proto instanceof ArrayBuffer) {
    return new Uint8Array(proto)
  }
  let length = 0
  for (; length in proto; ++length);
  const result = new Uint8Array(length)
  for (let i = 0; i < length; ++i) {
    result[i] = proto[i]
  }
  return result
}

interface IEncodeHelper<T> {
  encode (instance: T): Writer
  decode (data: Uint8Array): T
}

function protoEncodeInternal<T> (clazz: any, instance: T): Uint8Array {
  return (clazz as IEncodeHelper<T>).encode(instance).finish()
}

export function protoEncode<T> (inst: T): Uint8Array {
  return protoEncodeInternal(inst.constructor, inst)
}

export function protoDecode<T> (clazz: any, data: any): T {
  return (clazz as IEncodeHelper<T>).decode(decodeHelper(data))
}

export const WASTED_ADDRESS = '0x0'
