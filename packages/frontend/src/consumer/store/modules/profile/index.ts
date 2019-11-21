import { Module } from 'vuex'

import { getters } from './getters'
import { actions } from './actions'
import { mutations } from './mutations'
import { IProfileState } from './types'
import { RootState } from '@/consumer/store/types'
import { webproto, WebRoomName, WebEventName } from '@onder/interfaces'

export const state: IProfileState = {
  data: {
    account: null,
    shortAccount: '',
    avatar: '',
    timezone: 4,
    isSeller: false,

    balanceEth: 0,
    balanceChannel: 0,
    energyBalance: 0,
  },
  meta: {
    balanceRoomName: WebRoomName.Balance,
    balanceRoomType: webproto.RoomType.Balance,
    balanceRoomRequest: webproto.BalanceRoomRequest.create({
      type: webproto.RoomType.Balance,
    }),

    configEventName: WebEventName.Configuration
  }
}

const namespaced: boolean = true

export const profile: Module<IProfileState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
}
