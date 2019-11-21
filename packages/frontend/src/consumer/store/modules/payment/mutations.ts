import { MutationTree } from 'vuex'
import { IPaymentState } from './types'
import { fitArrayToSizeLimit } from '@/common/utils/array-helper'

export const mutations: MutationTree<IPaymentState> = {
  setDatetimeList ({ data }: IPaymentState, datetimeList: Array<number>) {
    data.datetimeList = fitArrayToSizeLimit(
      data.listSizeLimit,
      [ ...data.datetimeList, ...datetimeList ],
    )
  },
  setPowerList ({ data }: IPaymentState, powerList: Array<number>) {
    data.powerList = fitArrayToSizeLimit(
      data.listSizeLimit,
      [ ...data.powerList, ...powerList ]
    )
  },
  setWastedPowerList ({ data }: IPaymentState, wastedPowerList: Array<number>) {
    data.wastedPowerList = fitArrayToSizeLimit(
      data.listSizeLimit,
      [ ...data.wastedPowerList, ...wastedPowerList ]
    )
  },
  setPriceList ({ data }: IPaymentState, priceList: Array<number>) {
    data.priceList = fitArrayToSizeLimit(
      data.listSizeLimit,
      [ ...data.priceList, ...priceList ]
    )
  },
  setSellPriceList ({ data }: IPaymentState, sellPriceList: Array<number>) {
    data.sellPriceList = fitArrayToSizeLimit(
      data.listSizeLimit,
      [ ...data.sellPriceList, ...sellPriceList ]
    )
  },
}
