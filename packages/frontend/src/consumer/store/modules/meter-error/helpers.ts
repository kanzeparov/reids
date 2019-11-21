import * as moment from 'moment'

import { IMeterError } from './types'
import { shortenAccount } from '@/consumer/store/helpers'

const ERROR_DATE_FORMAT = 'DD MMM YYYY'
const ERROR_TIME_FORMAT = 'HH:mm:ss'

export const normalize = (er: any): IMeterError => {
  return {
    type: er.error.type,
    date: moment(er.from).format(ERROR_DATE_FORMAT),
    time: moment(er.from).format(ERROR_TIME_FORMAT),
    text: er.error.text,
    isFixed: false,
    fixedDate: moment(er.to).format(ERROR_DATE_FORMAT),
    fixedTime: moment(er.to).format(ERROR_TIME_FORMAT),
    id: '451',
  }
}
