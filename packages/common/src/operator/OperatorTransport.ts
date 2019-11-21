import { IOperatorTransportCallback, IOperatorClient } from '@onder/interfaces'
import OperatorTransportServer from './OperatorTransportServer'
import OperatorTransportClientFacade from './OperatorTransportClient'
import AddressService from '../AddressService'

export default class OperatorTransport {
  private port: number
  private client?: IOperatorClient
  constructor (port: number) {
    this.port = port
  }

  async startServer (addressService: AddressService, callback: IOperatorTransportCallback): Promise<void> {
    const srv = new OperatorTransportServer(this.port, addressService, callback)
    await srv.start()
  }

  async createClient (account: string, allowSendStatistic: boolean, addressService: AddressService): Promise<IOperatorClient> {
    if (this.client) {
      return Promise.resolve(this.client)
    }
    this.client = new OperatorTransportClientFacade(account, allowSendStatistic, addressService)
    return this.client
  }
}
