import { IProxySettings } from '@onder/interfaces'

export default class ProxySettings implements IProxySettings {
  private meterTransportProxy: string | undefined
  constructor () {
    this.meterTransportProxy = ProxySettings.lookupForProxy(process.env.METERTRANSPORT_PROXY)
  }

  /**
   * Helper function for gets a proxy from ENV
   * If given string isn't undefined return it's
   * else try get HTTPS/HTTP
   * @param proxy for test
   */
  private static lookupForProxy (proxy?: string): string | undefined {
    if (proxy) {
      return proxy
    }
    if (process.env.HTTPS_PROXY) {
      return process.env.HTTPS_PROXY
    }
    return process.env.HTTP_PROXY
  }

  getMeterTransportProxy (): string | undefined {
    return this.meterTransportProxy
  }
}
