import BigNumber from 'bignumber.js'

export default interface IMetaPayment {
  channelId: string
  sender: string
  receiver: string
  price: BigNumber
  value: BigNumber
  channelValue: BigNumber
  v: number
  r: string
  s: string
  contractAddress?: string
  meta: string
}
