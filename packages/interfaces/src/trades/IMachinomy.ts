import { IMeterValue } from '../meters'
import { Machinomy, PaymentChannel, PaymentRequiredResponse, RemoteChannelInfos } from 'machinomy'
import IMetaPayment from './IMetaPayment'
import { BigNumber } from 'bignumber.js'
import * as moment from 'moment'
import BuyResult from 'machinomy/lib/BuyResult'

export default interface IMachinomy {
  machinomy: Machinomy
  buy (upstreamAccount: string, meterValue: IMeterValue): Promise<string>
  buyWithPrice (upstreamAccount: string, power: BigNumber, price: BigNumber, datetime?: moment.Moment): Promise<BuyResult>
  getOpenChannelByRecieverAndSender (reciever: string, sender: string): Promise<PaymentChannel>
  offchainBalanceByChannelId (channelId: string): Promise<BigNumber>
  acceptPayment (metaPayment: IMetaPayment): Promise<string>
  upstreamAccounts (): Promise<Array<string>>
  onchainBalance (): Promise<BigNumber>
  offchainBalance (): Promise<BigNumber>
  onchainTokenBalance (): Promise<BigNumber>
  offchainTokenBalance (): Promise<BigNumber>
  getOpenChannels (sender: string): Promise<RemoteChannelInfos>
  notSettledTokenChannels (): Promise<PaymentChannel[]>
  paymentRequired (upstreamAccount: string, time?: moment.Moment): Promise<PaymentRequiredResponse>
  tokenContract (): string
  tokenName (): Promise<string>
}
