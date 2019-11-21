import { Module } from 'vuex'

import { getters } from './getters'
import { actions } from './actions'
import { mutations } from './mutations'
import { ITransactionState } from './types'
import { RootState } from '@/consumer/store/types'

import { webproto, WebRoomName } from '@onder/interfaces'

export const state: ITransactionState = {
  data: {
    /* Show only last 30 transactions */
    transactionsLimit: 30,
    transactions: [],
  },
  meta: {
    roomName: WebRoomName.Transactions,
    roomType: webproto.RoomType.Transactions,
    roomRequest: webproto.TransactionsRoomRequest.create({
      type: webproto.RoomType.Transactions,
    }),
  },
}

const namespaced: boolean = true

export const transaction: Module<ITransactionState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
}
