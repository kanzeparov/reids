import { WebsocketServer } from './WebsocketServer'
import { IPriceSource } from './IPriceSource'

export type ReplyCallback = (error: Error | null, result: Array<string>) => void

export class WebsocketRPC {
  server: WebsocketServer
  priceSource: IPriceSource

  constructor (server: WebsocketServer, priceSource: IPriceSource) {
    this.server = server
    this.priceSource = priceSource
    this.handleGetPrice = this.handleGetPrice.bind(this)

    this.server.expose('getPrice', this.handleGetPrice)
  }

  async start (): Promise<void> {
    await this.server.start()
  }

  async stop (): Promise<void> {
    await this.server.stop()
  }

  async handleGetPrice (params: Array<string>, reply: ReplyCallback) {
    const now = params[0] ? new Date(params[0]) : undefined
    const result = await this.priceSource.currentPrice(now)
    reply(null, [result.toString()])
  }
}
