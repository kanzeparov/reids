import { IOperatorTransportCallback,
  IProblemOccurredEvent,
  IProblemResolvedEvent,
  ITradeEvent,
  IOperatorDatabaseRequests,
  IConnectEvent,
  IDisconnectEvent,
  IClient} from '@onder/interfaces'

import Logger from '@machinomy/logger'

const log = new Logger('onder-operator-operatortransportcallback')

export default class OperatorTransportCallback implements IOperatorTransportCallback {
  private requests: IOperatorDatabaseRequests
  private clients: Array<IClient>

  constructor (requests: IOperatorDatabaseRequests) {
    this.requests = requests
    this.clients = []
  }

  public getOnlineClients (): Array<IClient> {
    return this.clients
  }

  public onTrade (event: ITradeEvent): Promise<void> {
    if (!event.client) {
      log.warn('Client not send a login before reserved a enent ', event.type)
      return Promise.resolve()
    }
    log.info('Client send enent ', event.type)
    return this.requests.addTrade(event)
  }

  public onProblemOccurred (event: IProblemOccurredEvent): Promise<void> {
    if (!event.client) {
      log.warn('Client not send a login before reserved a enent ', event.type)
      return Promise.resolve()
    }
    log.info('Client send enent ', event.type)
    return this.requests.addError(event)
  }

  public onProblemResolved (event: IProblemResolvedEvent): Promise<void> {
    if (!event.client) {
      log.warn('Client not send a login before reserved a enent ', event.type)
      return Promise.resolve()
    }
    log.info('Client send enent ', event.type)
    return this.requests.resolveError(event)
  }

  public onConnect (event: IConnectEvent): Promise<void> {
    log.info('Client connected ', event.client.account)
    this.clients.push(event.client)
    return Promise.resolve()
  }

  public onDisconnect (event: IDisconnectEvent): Promise<void> {
    if (!event.client) {
      log.warn('Client not send a login before reserved a enent ', event.type)
      return Promise.resolve()
    }
    log.info('Client disconnected ', event.client.account)
    const ind = this.clients.indexOf(event.client)
    if (ind > 0) {
      this.clients.splice(ind, 1)
    }
    return Promise.resolve()
  }
}
