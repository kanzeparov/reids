import { MutationTree } from 'vuex'
import { ICounterpartyState, ICounterparty } from './types'

export const mutations: MutationTree<ICounterpartyState> = {
  setCounterparties ({ data }: ICounterpartyState, counterparties: Array<ICounterparty>) {
    data.counterparties = counterparties
  },
}
