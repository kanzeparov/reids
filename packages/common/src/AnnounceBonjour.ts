import IResolve from './IResolve'

const bonjour = require('bonjour')()

export default class AnnounceBonjour {
  meterTransport (address: string, defaultPort: number): void {
    let name = IResolve.BONJOUR_METERTRANSPORT_ENDPOINT_NAME_PREFIX + address
    this.bonjourPublish(name, defaultPort)
  }

  tradeChannel (address: string, defaultPort: number): void {
    let name = IResolve.BONJOUR_TRADE_ENDPOINT_NAME_PREFIX + address
    this.bonjourPublish(name, defaultPort)
  }

  operatorTransport (address: string, defaultPort: number): void {
    this.bonjourPublish(IResolve.BONJOUR_OPERATOR_ENDPOINT_NAME_PREFIX, defaultPort)
  }

  private bonjourPublish (name: string, port: number): void {
    let type = 'onder'
    bonjour.publish({ name, port, type })
  }
}
