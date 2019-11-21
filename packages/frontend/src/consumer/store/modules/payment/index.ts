import { Module } from 'vuex'

import { getters } from './getters'
import { actions } from './actions'
import { mutations } from './mutations'
import { IPaymentState } from './types'
import { RootState } from '@/consumer/store/types'

import { webproto, WebRoomName } from '@onder/interfaces'

export const state: IPaymentState = {
  data: {
    /* Per 6 seconds period (100), for charts */
    listSizeLimit: 60 * 10 / 6,
    datetimeList: [],
    powerList: [],
    wastedPowerList: [],
    priceList: [],
    sellPriceList: [],
  },
  meta: {
    roomName: WebRoomName.Payments,
    roomType: webproto.RoomType.Payments,
    roomRequest: webproto.PaymentsRoomRequest.create({
      type: webproto.RoomType.Payments,
    }),
  },
}

const namespaced: boolean = true

export const payment: Module<IPaymentState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
}
