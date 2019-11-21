import * as moment from 'moment'

import { AvatarService } from '@/common/services/avatar-service'
import { ITransaction } from './types'
import { shortenAccount, numberWithDelimiter } from '@/consumer/store/helpers'

const TABLE_DATETIME_FORMAT = 'DD MMM YYYY HH:mm:ss'

export const normalize = (currentAccount: string, lp: any): ITransaction => {
  const account = lp.sender === currentAccount ? lp.receiver : lp.sender

  return {
    account,
    shortAccount: shortenAccount(account),
    avatar: AvatarService.generate(account),
    power: numberWithDelimiter(lp.power),
    price: numberWithDelimiter(lp.price),
    der: numberWithDelimiter(lp.total),
    datetime: moment(lp.lastUpdate).format(TABLE_DATETIME_FORMAT),
  }
}
