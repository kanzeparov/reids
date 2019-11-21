import * as JsonRPC from 'json-rpc-ws'

export type Handler = (params: Array<string>, reply: (error: Error | null, result: Array<string>) => void) => void

export class WebsocketServer {
  readonly server: JsonRPC.Server<JsonRPC.Connection>

  constructor (readonly host: string, readonly port: number) {
    this.server = JsonRPC.createServer()
  }

  expose (method: string, handler: Handler): void {
    this.server.expose(method, handler)
  }

  start (): Promise<void> {
    return new Promise<void>(resolve => {
      const options = {
        host: this.host,
        port: this.port
      }
      this.server.start(options, () => {
        resolve()
      })
    })
  }

  async stop (): Promise<void> {
    if (this.server.server) {
      this.server.stop()
    }
  }
}
