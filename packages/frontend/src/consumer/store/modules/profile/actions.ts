import { ActionTree, ActionContext } from 'vuex'
import { Observable } from 'rxjs'

import { webproto } from '@onder/interfaces'

import { AvatarService } from '@/common/services/avatar-service'

import { getRoomId } from '@/consumer/store/socket'
import { IProfileState } from './types'
import { RootState } from '@/consumer/store/types'

import websocket from '@/common/services/websocket-client'

import {
  createRoomDataStream,
  destroyRoomDataStream,
} from '@/consumer/store/helpers/room-data-stream'

type Context = ActionContext<IProfileState, RootState>

export const actions: ActionTree<IProfileState, RootState> = {
  async syncBalance ({ state, commit }: Context) {
    const { balanceRoomName, balanceRoomType, balanceRoomRequest } = state.meta
    const balanceRoomId = getRoomId(balanceRoomName)
    const room = {
      roomId: balanceRoomId,
      roomName: balanceRoomName,
      roomType: balanceRoomType,
      roomRequest: balanceRoomRequest,
    }

    const $roomDataStream: Observable<any> = createRoomDataStream(room)

    $roomDataStream.subscribe((data: webproto.BalanceRoomResponse) => {
      commit('setBalance', data)
    })

    return $roomDataStream
  },
  async desyncBalance ({ state }: Context) {
    const { balanceRoomName } = state.meta
    const balanceRoomId = getRoomId(balanceRoomName)

    destroyRoomDataStream(balanceRoomId)
  },

  async getConfig ({ state, commit }: Context) {
    const { configEventName } = state.meta
    const configRequest = webproto.ConfigurationEventRequest.create()

    const $configEvent = websocket.sendEvent(configEventName, configRequest)

    return $configEvent.then(({ configuration }: webproto.ConfigurationEventResponse) => {
      const meterConfig = configuration.meterConfiguration![0]
      const account = meterConfig.account
      const accountType = configuration.isSeller ? 'seller' : 'buyer'
      const avatar = AvatarService.generate(account)
      const isSeller = configuration.isSeller

      commit('setAccount', account)
      commit('setAccountType', accountType)
      commit('setAvatar', avatar)
      commit('setIsSeller', isSeller)
    })
  },
}
