import { IError } from '../../errors'
import * as moment from 'moment'

export interface IWebError {
  readonly error: IError
  readonly from?: moment.Moment
  to?: moment.Moment
}
