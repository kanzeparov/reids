import { IRoomMeta } from '@/consumer/store/types'

export interface IPaymentData {
  /* Used in charts */
  listSizeLimit: number
  datetimeList: Array<number>
  powerList: Array<number>
  wastedPowerList: Array<number>
  priceList: Array<number>
  sellPriceList: Array<number>
}

export interface IPaymentState {
  data: IPaymentData
  meta: IRoomMeta
}

export interface IPaymentAggregation {
  [datetime: number]: IPaymentAggregationPoint
}

export interface IPaymentAggregationPoint {
  power: number
  wastedPower: number
  price: number
  sellPrice: number
}

export interface IPaymentDistribution {
  datetimeList: Array<number>
  powerList: Array<number>
  wastedPowerList: Array<number>
  priceList: Array<number>
  sellPriceList: Array<number>
}
