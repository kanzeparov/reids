import { BigNumber } from 'bignumber.js'
import { ILightPayment, PaymentState } from '@onder/interfaces'
import { Moment } from 'moment'

export default class LightPayment implements ILightPayment {
  public token: string
  public sender: string
  public receiver: string
  public power: BigNumber
  public price: BigNumber
  public datetime: Moment
  public total: BigNumber
  public state: PaymentState
  constructor (token: string,
               sender: string,
               receiver: string,
               power: BigNumber,
               price: BigNumber,
               datetime: Moment,
               state: PaymentState) {
    this.token = token
    this.sender = sender
    this.receiver = receiver
    this.power = power
    this.price = price
    this.datetime = datetime
    this.total = this.power.times(this.price)
    this.state = state
  }
}
