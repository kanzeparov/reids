import { ITrade, IMeterValue } from '@onder/interfaces'
import { Payment } from 'machinomy'
import { Moment } from 'moment'

export default class Trade implements ITrade {
  private readonly timestamp: Moment
  private readonly measurement: IMeterValue
  private readonly payment: Payment

  constructor (timestamp: Moment, measurement: IMeterValue, payment: Payment) {
    this.timestamp = timestamp
    this.measurement = measurement
    this.payment = payment
  }

  public getTimestamp () {
    return this.timestamp
  }

  public getMeasurement () {
    return this.measurement
  }

  public getPayment () {
    return this.payment
  }
}
