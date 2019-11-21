import Logger from './Logger'
import IResolve from './IResolve'
import { URL } from 'url'

const bonjour = require('bonjour')()

const log = new Logger('resolve-bonjour')

export default class ResolveBonjour implements IResolve {
  private upstreamCache: Map<string, URL> = new Map()

  async meterTransport (account: string): Promise<URL> {
    let address = IResolve.BONJOUR_METERTRANSPORT_ENDPOINT_NAME_PREFIX + account
    let resolved = await this.resolve(address)
    log.debug('Resolved meterTransport', address, resolved)
    return resolved
  }

  async operatorTransport (): Promise<URL> {
    let resolved = await this.resolve(IResolve.BONJOUR_OPERATOR_ENDPOINT_NAME_PREFIX)
    log.debug('Resolved operatorTransport', resolved)
    return resolved
  }

  async tradeChannel (account: string): Promise<URL> {
    let address = IResolve.BONJOUR_TRADE_ENDPOINT_NAME_PREFIX + account
    let resolved = await this.resolve(address)
    log.debug('Resolved tradeChannel', address, resolved.toString())
    return resolved
  }

  private async resolve (address: string): Promise<URL> {
    let cached = this.upstreamCache.get(address)
    if (cached) {
      return cached
    }

    return new Promise<URL>((resolve, reject) => {
      let timeout = setTimeout(() => {
        reject(`Can't find a bonjour service with address ${address}`)
      }, 5000)
      bonjour.find({ type: 'onder' }, (service: any) => {
        if (service.type === 'onder' && service.name === address) {
          const ip = service.addresses.find((el: string) => {
            return /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/.test(el)
          })
          const result = new URL(`http://${ip}:${service.port}`)
          this.upstreamCache.set(address, result)
          clearTimeout(timeout)
          resolve(result)
        }
      })
    })
  }
}
