import { BigNumber } from 'bignumber.js'
import * as J from 'json-rpc-ws'
import * as moment from 'moment'
import Logger from './Logger'
import { URL } from 'url'

const log = new Logger('price-provider')

export class PriceProvider {
  dsmUrl: URL
  client: J.Client<J.Connection>

  constructor (dsmUrl: URL) {
    this.dsmUrl = dsmUrl
    this.client = J.createClient()
  }

  async ensureConnected (): Promise<void> {
    if (this.client.isConnected()) {
      return
    } else {
      log.info('Connecting to price provider...')
      return new Promise<void>((resolve, reject) => {
        this.client.connect(this.dsmUrl.toString(), () => {
          resolve()
        })
      })
    }
  }

  async getPrice (): Promise<BigNumber> {
    await this.ensureConnected()
    const priceString = await new Promise<string | undefined>((resolve, reject) => {
      this.client.send<[], string>('getPrice', [], (error, params) => {
        error ? reject(error) : resolve(params)
      })
    })
    log.info(`Current price on ${moment().toISOString()} is ${priceString}`)
    if (priceString) {
      return new BigNumber(priceString)
    } else {
      throw new Error('Got empty price')
    }
  }
}
