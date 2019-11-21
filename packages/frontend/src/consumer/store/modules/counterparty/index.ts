import { Module } from 'vuex'

import { getters } from './getters'
import { actions } from './actions'
import { mutations } from './mutations'
import { ICounterpartyState } from './types'
import { RootState } from '@/consumer/store/types'

import { webproto, WebRoomName } from '@onder/interfaces'

export const state: ICounterpartyState = {
  data: {
    counterparties: [],
  },
  meta: {
    roomName: WebRoomName.Partners,
    roomType: webproto.RoomType.Partners,
    roomRequest: webproto.PartnersRoomRequest.create({
      type: webproto.RoomType.Partners,
    }),
  }
}

const namespaced: boolean = true

export const counterparty: Module<ICounterpartyState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
}
