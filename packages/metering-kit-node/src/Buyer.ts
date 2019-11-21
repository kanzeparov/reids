import { IMeterValue,
         IMachinomy,
         ITrade } from '@onder/interfaces'
import { BigNumber } from 'bignumber.js'
import Logger from './Logger'
import { TypedEventEmitter } from '@elderapo/typed-event-emitter'
import NodeDatabase from './typeOrmDatabase/nodeDatabase'
import moment = require('moment')
import { Trade } from '@onder/common'
import BuyResult from 'machinomy/lib/BuyResult'

const log = new Logger('buyer')

class Buyer extends TypedEventEmitter<Buyer.Events> {
  private readonly machinomy: IMachinomy
  private readonly db: NodeDatabase

  constructor (machinomy: IMachinomy, db: NodeDatabase) {
    super()
    this.machinomy = machinomy
    this.db = db
  }

  async buyEnergy (upstreamAccount: string, meterValue: IMeterValue): Promise<void> {
    log.info(`Buying energy: ${meterValue.value} at ${meterValue.datetime}`)
    const paymentID = await this.machinomy.buy(upstreamAccount, meterValue)
    const trade = await this.addTrade(meterValue, paymentID)
    log.info(`Bought energy: ${meterValue.value} at ${meterValue.datetime}`)
    this.emit(Buyer.Event.BUY, trade)
  }

  async buyEnergyWithPrice (upstreamAccount: string, power: BigNumber, price: BigNumber, datetime: moment.Moment): Promise<BuyResult> {
    const buyResult = await this.machinomy.buyWithPrice(upstreamAccount, power, price, datetime)
    //const trade = await this.db.requests.addTrade(meterValue, paymentID)
    //this.emit(Buyer.Event.BUY, trade)
    return buyResult
  }

  private async addTrade (meterValue: IMeterValue, token: string): Promise<ITrade> {
    const time = moment().utc()
    const payment = await this.machinomy.machinomy.paymentById(token)
    if (!payment) throw new Error('payment is null')
    return new Trade(time, meterValue, payment)
  }
}

namespace Buyer {
  export enum Event {
    BUY
  }

  export type Events = {
    [Event.BUY]: ITrade
  }
}

export default Buyer
