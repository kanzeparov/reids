import { URL } from 'url'

interface IResolve {
  meterTransport (address: string): Promise<URL>
  tradeChannel (address: string): Promise<URL>
  operatorTransport (): Promise<URL>
}

namespace IResolve {
  export const BONJOUR_TRADE_ENDPOINT_NAME_PREFIX = 'onder_'
  export const BONJOUR_METERTRANSPORT_ENDPOINT_NAME_PREFIX = 'onder_mt_'
  export const BONJOUR_OPERATOR_ENDPOINT_NAME_PREFIX = 'onder_op'
}

export default IResolve
