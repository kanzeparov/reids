import { ILightPayment, IMachinomy, IMetaPayment, ITradeChannelCallback, PaymentState } from '@onder/interfaces'
import { BigNumber } from 'bignumber.js'
import * as moment from 'moment'
import Logger from './Logger'
import { PriceProvider } from './PriceProvider'
import ProblemController from './ProblemController'
import { LightPayment } from '@onder/common'
import { RemoteChannelInfos } from 'machinomy'
import { TypedEventEmitter } from '@elderapo/typed-event-emitter'
import NodeDatabase from './typeOrmDatabase/nodeDatabase'
import TradeChannel from './TradeChannel'

const log = new Logger('seller')

class Seller extends TypedEventEmitter<Seller.Events> implements ITradeChannelCallback {
  private readonly tradeChannel: TradeChannel
  private readonly db: NodeDatabase
  private readonly machinomy: IMachinomy
  private readonly account: string
  private readonly problemController: ProblemController
  private readonly priceProvider: PriceProvider

  constructor (problemController: ProblemController, tradeChannel: TradeChannel, db: NodeDatabase, machinomy: IMachinomy, account: string, priceProvider: PriceProvider) {
    super()
    this.tradeChannel = tradeChannel
    this.db = db
    this.machinomy = machinomy
    this.account = account
    this.problemController = problemController
    this.priceProvider = priceProvider
  }

  async init (): Promise<void> {
    return this.tradeChannel.startTradeServer(this)
  }

  async getPrice (date: moment.Moment): Promise<BigNumber> {
    // const price = await this.priceProvider.getPrice()
    // return price

    return new BigNumber(0)
  }

  getTokenContract (): string {
    return this.machinomy.tokenContract()
  }

  async acceptPayment (metaPayment: IMetaPayment): Promise<string> {
    let tmpPayment: any = metaPayment
    const token = await this.machinomy.acceptPayment(tmpPayment)
    const metaStr = tmpPayment.payment.meta
    if (tmpPayment.payment.price !== 0) {
      try {
        const meta = JSON.parse(metaStr).data
        const dPayment = new LightPayment(token, meta.id, this.account,
            new BigNumber(meta.power), new BigNumber(tmpPayment.payment.price), moment(meta.time).utc(),
            PaymentState.off_chain)
        await this.problemController.getOperatorClient(this.account).then((client) => {
          return client.sendTrade(dPayment.sender, dPayment.receiver, dPayment.datetime, dPayment.power, dPayment.price)
            .catch((reason) => {
              log.error('Trading not sent. Error:', reason)
            })
        }).catch((reason) => {
          log.error("Can't gets operator client for send trade to operator", reason)
        })
        this.notifyOnSell(dPayment)
      } catch (err) {
        log.error(`Error while save payment(db.requests.addPayment) ${err}`)
      }
    }
    return token
  }

  getOpenChannels (sender: string): Promise<RemoteChannelInfos> {
    return this.machinomy.getOpenChannels(sender)
  }

  async addPayment (payment: ILightPayment): Promise<void> {
    if (payment.power.isZero()) {
      // await this.db.requests.deletePayment(payment)
    } else {
      // await this.db.requests.addPayment(payment)
    }
    this.notifyOnSell(payment)
  }

  private notifyOnSell (payment: ILightPayment): void {
    this.emit(Seller.Event.SELL, payment)
  }
}

namespace Seller {
  export enum Event {
    SELL
  }

  export type Events = {
    [Event.SELL]: ILightPayment
  }
}

export default Seller
