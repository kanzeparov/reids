import moment from 'moment'
import { BigNumber } from 'bignumber.js'

export default class MeterValue {
  public value: BigNumber
  public delta: BigNumber
  public datetime: moment.Moment
  public id: BigNumber
  constructor (value: BigNumber,
    delta: BigNumber,
    datetime: moment.Moment,
    id: BigNumber) {
    this.value = value
    this.delta = delta
    this.datetime = datetime
    this.id = id
  }
}

export type MeterValues = MeterValue[]
