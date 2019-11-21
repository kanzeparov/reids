import { GetterTree } from 'vuex'

import { RootState } from '@/consumer/store/types'
import { ICounterpartyState, ICounterpartyDecorator } from './types'

import { decorateSellerCounterparty, decorateBuyerCounterparty } from './helpers'
import { numberWithDelimiter } from '@/consumer/store/helpers'
import { sumBy } from '@/common/utils/array-helper'

export const getters: GetterTree<ICounterpartyState, RootState> = {
  counterparties ({ data }: ICounterpartyState): Array<ICounterpartyDecorator> {
    const isSeller = true
    const decorate = isSeller ? decorateSellerCounterparty : decorateBuyerCounterparty

    return data.counterparties.map(decorate)
  },

  totalPower (_: ICounterpartyState, getters: any): string {
    const total: number = getters.counterparties.reduce(sumBy('totalPower'), 0)
    return numberWithDelimiter(total)
  },
  totalPrice (_: ICounterpartyState, getters: any): string {
    const total: number = getters.counterparties.reduce(sumBy('totalPrice'), 0)
    return numberWithDelimiter(total)
  },
  totalDer (_: ICounterpartyState, getters: any): string {
    const total: number = getters.counterparties.reduce(sumBy('der'), 0)
    return numberWithDelimiter(total)
  },
}
