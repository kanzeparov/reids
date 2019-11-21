import { ActionTree, ActionContext } from 'vuex'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { webproto } from '@onder/interfaces'

import { ITransactionState, ITransaction } from './types'
import { RootState } from '@/consumer/store/types'
import { normalize } from './helpers'

import { getRoomId } from '@/consumer/store/socket'

import {
  createRoomDataStream,
  destroyRoomDataStream,
} from '@/consumer/store/helpers/room-data-stream'

type Context = ActionContext<ITransactionState, RootState>

export const actions: ActionTree<ITransactionState, RootState> = {
  async syncTransactions ({ dispatch, getters, state, commit }: Context) {
    const roomId = getRoomId(state.meta.roomName)
    const room = { roomId, ...state.meta }

    const $roomDataStream: Observable<any> = createRoomDataStream(room, [
      map(({ value }: webproto.PartnersRoomResponse) => {
        return value.map(normalize.bind(null, getters.account))
      }),
    ])

    $roomDataStream.subscribe((transactions: Array<ITransaction>) => {
      commit('setTransactions', transactions)
    })

    return $roomDataStream
  },
  async desyncTransactions ({ state }: Context) {
    const roomId = getRoomId(state.meta.roomName)
    destroyRoomDataStream(roomId)
  },
}
