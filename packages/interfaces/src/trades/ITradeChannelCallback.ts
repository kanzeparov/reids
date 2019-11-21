import * as moment from 'moment'
import { BigNumber } from 'bignumber.js'
import IMetaPayment from './IMetaPayment'
import { RemoteChannelInfos } from 'machinomy'

export default interface ITradeChannelCallback {
  getPrice (date: moment.Moment): Promise<BigNumber>
  getOpenChannels (sender: string): Promise<RemoteChannelInfos>
  acceptPayment (payment: IMetaPayment): Promise<string>
  getTokenContract (): string
}
