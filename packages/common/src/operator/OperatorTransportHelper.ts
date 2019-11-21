import OperatorTransportServer from './OperatorTransportServer'
import io from 'socket.io'
import { IConnectEvent, IOperatorTransportCallback, IClient, IDisconnectEvent } from '@onder/interfaces'

let data: Map<OperatorTransportServer, Map<io.Socket, IClient>> = new Map()

export function getOperatorTransportServerSocketClient (server: OperatorTransportServer, ioapp: io.Server, socket: io.Socket, callback: IOperatorTransportCallback, sockdata: any): IClient | undefined {
  const sockets = data.get(server)
  if (sockets) {
    return sockets.get(socket)
  }
  return undefined
}

export function initOperatorTransportServerSocket (server: OperatorTransportServer, ioapp: io.Server, socket: io.Socket, callback: IOperatorTransportCallback) {
  if (!data.has(server)) {
    data.set(server, new Map())
  }
  socket.on('ConnectEvent', (sockdata: any) => {
    const sockets = data.get(server)
    if (sockets) {
      sockets.set(socket, sockdata.client)
    }
    callback.onConnect({ client: sockdata.client } as IConnectEvent).then(() => {
      // Do Nothing
    }).catch(error => {
      console.error(error)
    })
  })

  socket.on('disconnect',() => {
    const sockets = data.get(server)
    if (sockets) {
      if (sockets.has(socket)) {
        const client = sockets.get(socket)
        if (client) {
          callback.onDisconnect({ client: client } as IDisconnectEvent).then(() => {
            // Do Nothing
          }).catch(error => {
            console.error(error)
          })
        }
        sockets.delete(socket)
      }
    }
  })
}
