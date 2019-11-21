import { ActionTree, ActionContext } from 'vuex'
import { Observable } from 'rxjs'
import { map, takeUntil, finalize } from 'rxjs/operators'

import { webproto, RoomPeriod } from '@onder/interfaces'

import { getRoomId } from '@/consumer/store/socket'
import { normalize } from './helpers'

import { ICounterpartyState, ICounterparty } from './types'
import { RootState } from '@/consumer/store/types'

import {
  createRoomDataStream,
  destroyRoomDataStream,
} from '@/consumer/store/helpers/room-data-stream'

type Context = ActionContext<ICounterpartyState, RootState>

export const actions: ActionTree<ICounterpartyState, RootState> = {
  async syncCounterparties ({ dispatch, getters, state, commit }: Context) {
    const roomId = getRoomId(state.meta.roomName, RoomPeriod.min10)
    const room = { roomId, ...state.meta }

    const $roomDataStream: Observable<any> = createRoomDataStream(room, [
      map(({ value }: webproto.PartnersRoomResponse) => value.map(normalize)),
    ])

    $roomDataStream.subscribe((counterparties: Array<ICounterparty>) => {
      commit('setCounterparties', counterparties)
    })

    return $roomDataStream
  },
  async desyncCounterparties ({ state }: Context) {
    const roomId = getRoomId(state.meta.roomName, RoomPeriod.min10)
    destroyRoomDataStream(roomId)
  }
}
