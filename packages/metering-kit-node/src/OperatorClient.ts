import { ITrade } from '@onder/interfaces'
import { TypedEventEmitter } from '@elderapo/typed-event-emitter'
import Logger from './Logger'
import axios from 'axios'
import { URL } from 'url'
import { IOperatorClient, Stats } from './IOperatorClient'

const log = new Logger('operator-client')

export class OperatorClient extends TypedEventEmitter<OperatorClient.Events> implements IOperatorClient {
  url: string

  constructor (base: URL, meterAccount: string) {
    super()
    this.url = `${base.toString()}api/meters/${meterAccount}`
    this.on(OperatorClient.Event.FRESH_STATS, this.handleFreshStats.bind(this))
  }

  sendStats (stats: Stats): void {
    this.emit(OperatorClient.Event.FRESH_STATS, stats)
  }

  sendTrade (trade: ITrade): void {
    let timestamp = Math.floor(trade.getMeasurement().datetime.valueOf() / 1000)
    const stats = {
      sellerId: trade.getPayment().receiver,
      buyerId: trade.getPayment().sender,
      time: timestamp,
      saleWh: trade.getMeasurement().value.toNumber(),
      cost: trade.getPayment().price.toString()
    }
    this.emit(OperatorClient.Event.FRESH_STATS, stats)
  }

  private async handleFreshStats (stats: Stats): Promise<void> {
    try {
      log.info('Posting stats to operator', stats)
      await axios.post(this.url, stats)
    } catch (e) {
      log.error('Can not post to operator', e)
    }
  }
}

export namespace OperatorClient {
  export enum Event {
    FRESH_STATS
  }

  export type Events = {
    [Event.FRESH_STATS]: Stats
  }
}
