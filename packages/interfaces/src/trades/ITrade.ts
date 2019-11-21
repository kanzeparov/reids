import { Payment } from 'machinomy'
import { IMeterValue } from '../meters'
import { Moment } from 'moment'

export default interface ITrade {
  getTimestamp (): Moment
  getMeasurement (): IMeterValue
  getPayment (): Payment
}
