import { Module } from 'vuex'

import { getters } from './getters'
import { actions } from './actions'
import { mutations } from './mutations'
import { IMeterErrorState } from './types'
import { RootState } from '@/consumer/store/types'

import { webproto, WebRoomName } from '@onder/interfaces'

export const state: IMeterErrorState = {
  data: {
    errors: [],
  },
  meta: {
    roomName: WebRoomName.Errors,
    roomType: webproto.RoomType.Error,
    roomRequest: webproto.ErrorRoomRequest.create({
      type: webproto.RoomType.Error,
    }),
  }
}

const namespaced: boolean = true

export const meterError: Module<IMeterErrorState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
}
