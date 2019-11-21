import Logger from './Logger'
import IResolve from './IResolve'
import { URL } from 'url'
import { DefaultPorts } from './DefaultPorts'

const log = new Logger('resolve-dns')

export default class ResolveDNS implements IResolve {
  private readonly domain: string

  constructor (domain?: string) {
    if (domain) {
      this.domain = domain.replace(/^\./, '')
    } else {
      throw new Error('Expect domain to be set')
    }
  }

  async meterTransport (account: string): Promise<URL> {
    let port = DefaultPorts.METER_TRANSPORT
    let resolved = new URL(`http://${account}.${this.domain}:${port}`)
    log.debug('Resolved meterTransport', account, resolved.toString())
    return resolved
  }

  async operatorTransport (): Promise<URL> {
    let port = DefaultPorts.OPERATOR_TRANSPORT
    let resolved = new URL(`http://${IResolve.BONJOUR_OPERATOR_ENDPOINT_NAME_PREFIX}.${this.domain}:${port}`)
    log.debug('Resolved operatorTransport', resolved.toString())
    return resolved
  }

  async tradeChannel (account: string): Promise<URL> {
    let port = DefaultPorts.TRADE_CHANNEL
    let resolved = new URL(`http://${account}.${this.domain}:${port}`)
    log.debug('Resolved tradeChannel', account, resolved.toString())
    return resolved
  }
}
