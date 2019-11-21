import { ActionTree, ActionContext } from 'vuex'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { webproto, RoomPeriod } from '@onder/interfaces'

import { IPaymentState, IPaymentDistribution } from './types'
import { RootState } from '@/consumer/store/types'
import { aggregatePayments, distributePayments, normalizeDistSize } from './helpers'

import { getRoomId } from '@/consumer/store/socket'

import {
  createRoomDataStream,
  destroyRoomDataStream,
} from '@/consumer/store/helpers/room-data-stream'

type Context = ActionContext<IPaymentState, RootState>

export const actions: ActionTree<IPaymentState, RootState> = {
  async syncPayments ({ dispatch, getters, state, rootGetters, commit }: Context) {
    const roomId = getRoomId(state.meta.roomName, RoomPeriod.min10)
    const room = { roomId, ...state.meta }

    const account: string = rootGetters.account
    const isSeller = rootGetters.isSeller as boolean

    const $roomDataStream: Observable<any> = createRoomDataStream(room, [
      map(({ value }: webproto.PartnersRoomResponse) => value),
      map(aggregatePayments.bind(null, account, isSeller)),
      map(distributePayments),
      map(normalizeDistSize.bind(null, state.data.listSizeLimit)),
    ])

    $roomDataStream.subscribe((dist: IPaymentDistribution) => {
      commit('setDatetimeList', dist.datetimeList)
      commit('setPowerList', dist.powerList)
      commit('setWastedPowerList', dist.wastedPowerList)
      commit('setPriceList', dist.priceList)
      commit('setSellPriceList', dist.sellPriceList)
    })

    return $roomDataStream
  },
  async desyncPayments ({ state }: Context) {
    const roomId = getRoomId(state.meta.roomName, RoomPeriod.min10)
    destroyRoomDataStream(roomId)
  }
}
