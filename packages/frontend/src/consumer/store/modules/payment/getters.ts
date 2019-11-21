import { GetterTree } from 'vuex'

import * as moment from 'moment'

import { RootState } from '@/consumer/store/types'
import { IPaymentState } from './types'
import { sum } from '@/common/utils/array-helper'
import { numberWithDelimiter } from '@/consumer/store/helpers'

const CHART_DATETIME_FORMAT = 'HH:mm'

export const getters: GetterTree<IPaymentState, RootState> = {
  datetimeTicks ({ data }: IPaymentState): Array<string> {
    const tickStep = Math.ceil(data.datetimeList.length / 4)
    const head = data.datetimeList.filter(
      (_: any, index: number) => index % tickStep === 0
    )
    const tail = data.datetimeList[data.datetimeList.length - 1]

    return [ ...head, tail ].map(
      (dt: number) => moment(dt).format(CHART_DATETIME_FORMAT)
    )
  },

  totalPower ({ data }: IPaymentState): string {
    return numberWithDelimiter(
      data.powerList.reduce(sum, 0)
    )
  },
  totalWastedPower ({ data }: IPaymentState): string {
    return numberWithDelimiter(
      data.wastedPowerList.reduce(sum, 0)
    )
  },

  totalPrice ({ data }: IPaymentState): string {
    return numberWithDelimiter(
      data.priceList.reduce(sum, 0)
    )
  },

  totalSellPrice ({ data }: IPaymentState): string {
    return numberWithDelimiter(
      data.sellPriceList.reduce(sum, 0)
    )
  },
}
