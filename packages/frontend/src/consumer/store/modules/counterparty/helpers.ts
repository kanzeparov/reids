import * as moment from 'moment'

import { AvatarService } from '@/common/services/avatar-service'
import { ICounterparty, ICounterpartyDecorator } from './types'
import { shortenAccount, numberWithDelimiter } from '@/consumer/store/helpers'

export const normalize = (ca: any): ICounterparty => {
  return {
    account: ca.account,
    shortAccount: shortenAccount(ca.account),
    avatar: AvatarService.generate(ca.account),
    buysPower: numberWithDelimiter(ca.buysPower),
    buysTotalPrice: numberWithDelimiter(ca.buysTotalPrice),
    sellsPower: numberWithDelimiter(ca.sellsPower),
    sellsTotalPrice: numberWithDelimiter(ca.sellsTotalPrice),
    der: numberWithDelimiter(0.1),
    lastUpdate: moment(ca.datetime).fromNow(),
  }
}

/* Pivot table helpers */

export const decorateSellerCounterparty = (ca: ICounterparty): ICounterpartyDecorator => {
  return {
    account: ca.account,
    shortAccount: ca.shortAccount,
    avatar: ca.avatar,
    totalPower: ca.sellsPower,
    totalPrice: ca.sellsTotalPrice,
    der: ca.der,
    lastUpdate: ca.lastUpdate,
  }
}

export const decorateBuyerCounterparty = (ca: ICounterparty): ICounterpartyDecorator => {
  return {
    account: ca.account,
    shortAccount: ca.shortAccount,
    avatar: ca.avatar,
    totalPower: ca.buysPower,
    totalPrice: ca.buysTotalPrice,
    der: ca.der,
    lastUpdate: ca.lastUpdate,
  }
}
