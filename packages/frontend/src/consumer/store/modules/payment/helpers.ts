import { WASTED_ADDRESS } from '@onder/interfaces'
import { IPaymentAggregation, IPaymentAggregationPoint, IPaymentDistribution } from './types'
import { fitArrayToSizeLimit } from '@/common/utils/array-helper'

type IPaymentAggPoint = IPaymentAggregationPoint
type IPaymentAgg = IPaymentAggregation
type IPaymentDist = IPaymentDistribution

/* Aggregation Point Helpers */

const buildBlankPoint = (): IPaymentAggPoint => {
  // const rand = 1 + Math.ceil(Math.random() * 100)
  return {
    power: 0,
    wastedPower: 0,
    price: 0,
    sellPrice: 0,
    // power: rand,
    // wastedPower: rand / 5,
    // price: rand / (Math.random() * 10 + 5),
    // sellPrice: 1 + 5 * Math.random(),
  }
}

const extendWastedPoint = (point: IPaymentAggPoint, lp: any): IPaymentAggPoint => {
  return {
    ...point,
    wastedPower: Number(lp.power),
    // wastedPower: point.power / 5,
  }
}

const extendRegularPoint = (point: IPaymentAggPoint, lp: any): IPaymentAggPoint => {
  const rand = Math.ceil(Math.random() * 100)
  return {
    ...point,
    // power: rand,
    // price: rand / (Math.random() * 10 + 5),
    // sellPrice: 1 + 5 * Math.random(),
    power: Number(lp.power),
    price: Number(lp.price),
    sellPrice: Number(lp.price) / Number(lp.power) || 0,
  }
}

const extendSellerPoint = (currentAccount: string, point: IPaymentAggPoint, lp: any): IPaymentAggPoint => {
  const isWasted = lp.sender === WASTED_ADDRESS
  if (isWasted) {
    return extendWastedPoint(point, lp)
  }

  const isSender = lp.receiver === currentAccount
  if (isSender) {
    return extendRegularPoint(point, lp)
  }

  return point
}

const extendBuyerPoint = (currentAccount: string, point: IPaymentAggPoint, lp: any): IPaymentAggPoint => {
  const isReceiver = lp.sender === currentAccount
  if (isReceiver) {
    return extendRegularPoint(point, lp)
  }

  return point
}

/* Aggregation Helpers */

export const aggregatePayments = (
  currentAccount: string,
  isSeller: boolean,
  payments: Array<any>
): IPaymentAgg => {
  return payments.reduce((memo: IPaymentAgg, lp: any): IPaymentAgg => {
    const datetime = lp.datetime
    let point = memo[datetime] && { ...memo[datetime] } || buildBlankPoint()

    point = isSeller ?
      extendSellerPoint(currentAccount, point, lp) :
      extendBuyerPoint(currentAccount, point, lp)

    return { ...memo, [datetime]: point }
  }, {})
}

/* Distribution Helpers */

export const distributePayments = (aggregatedPayments: IPaymentAgg): IPaymentDist => {
  const paymentEntries = Object.entries(aggregatedPayments)
  return paymentEntries.reduce((memo: IPaymentDist, entry: any) => {
    const [ datetime, agg ] = entry

    return {
      datetimeList: [ ...memo.datetimeList, Number(datetime) ],
      powerList: [ ...memo.powerList, agg.power ],
      wastedPowerList: [ ...memo.wastedPowerList, agg.wastedPower ],
      priceList: [ ...memo.priceList, agg.price ],
      sellPriceList: [ ...memo.sellPriceList, agg.sellPrice ],
    }
  }, {
    datetimeList: [],
    powerList: [],
    wastedPowerList: [],
    priceList: [],
    sellPriceList: [],
  })
}

export const normalizeDistSize = (sizeLimit: number, dist: IPaymentDist): IPaymentDist => {
  return {
    datetimeList: fitArrayToSizeLimit(sizeLimit, dist.datetimeList),
    powerList: fitArrayToSizeLimit(sizeLimit, dist.powerList),
    wastedPowerList: fitArrayToSizeLimit(sizeLimit, dist.wastedPowerList),
    priceList: fitArrayToSizeLimit(sizeLimit, dist.priceList),
    sellPriceList: fitArrayToSizeLimit(sizeLimit, dist.sellPriceList),
  }
}
