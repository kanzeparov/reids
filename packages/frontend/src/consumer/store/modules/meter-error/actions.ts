import { ActionTree, ActionContext } from 'vuex'
import { Observable, Subject } from 'rxjs'
import { map, takeUntil, finalize } from 'rxjs/operators'

import { webproto } from '@onder/interfaces'

import { getRoomId } from '@/consumer/store/socket'
import { normalize } from './helpers'

import { IMeterErrorState, IMeterError } from './types'
import { RootState } from '@/consumer/store/types'

import {
  createRoomDataStream,
  destroyRoomDataStream,
} from '@/consumer/store/helpers/room-data-stream'

type Context = ActionContext<IMeterErrorState, RootState>

export const actions: ActionTree<IMeterErrorState, RootState> = {
  async syncMeterErrors ({ dispatch, getters, state, commit }: Context) {
    const roomId = getRoomId(state.meta.roomName)
    const room = { roomId, ...state.meta }

    // const $roomDataStream: Observable<any> = createRoomDataStream(room, [
    //   map((response: any) => response.map(normalize)),
    // ])
    //
    // $roomDataStream.subscribe((errors: Array<IMeterError>) => {
    //   commit('setErrors', errors)
    // })

    // Remove mocks when backend data is ready

    const $roomDataStream = new Observable((s: any) => {
      s.next({
        value: [
          {
            type: 'Not responding',
            date: '16 Jan 2018',
            time: '15:08:43',
            text: '0x0a898…ga9s8 not responding',
            isFixed: true,
            fixedDate: '17 Jan 2018',
            fixedTime: '16:27:57',
            id: '451',
          },
          {
            type: 'Not responding',
            date: '18 Jan 2018',
            time: '15:08:43',
            text: '0x0a898…ga9s8 not responding',
            isFixed: true,
            fixedDate: '17 Jan 2018',
            fixedTime: '16:27:57',
            id: '451',
          },
          {
            type: 'Not responding',
            date: '16 Jan 2018',
            time: '15:08:43',
            text: '0x0a898…ga9s8 not responding',
            isFixed: true,
            fixedDate: '17 Jan 2018',
            fixedTime: '16:27:57',
            id: '451',
          },
          {
            type: 'Not responding',
            date: '18 Jan 2018',
            time: '15:08:43',
            text: '0x0a898…ga9s8 not responding',
            isFixed: true,
            fixedDate: '17 Jan 2018',
            fixedTime: '16:27:57',
            id: '451',
          },
          {
            type: 'Not responding',
            date: '16 Jan 2018',
            time: '15:08:43',
            text: '0x0a898…ga9s8 not responding',
            isFixed: true,
            fixedDate: '17 Jan 2018',
            fixedTime: '16:27:57',
            id: '451',
          },
          {
            type: 'Not responding',
            date: '18 Jan 2018',
            time: '15:08:43',
            text: '0x0a898…ga9s8 not responding',
            isFixed: true,
            fixedDate: '17 Jan 2018',
            fixedTime: '16:27:57',
            id: '451',
          },
          {
            type: 'Not responding',
            date: '16 Jan 2018',
            time: '15:08:43',
            text: '0x0a898…ga9s8 not responding',
            isFixed: true,
            fixedDate: '17 Jan 2018',
            fixedTime: '16:27:57',
            id: '451',
          },
          {
            type: 'Not responding',
            date: '18 Jan 2018',
            time: '15:08:43',
            text: '0x0a898…ga9s8 not responding',
            isFixed: true,
            fixedDate: '17 Jan 2018',
            fixedTime: '16:27:57',
            id: '451',
          },
          {
            type: 'Not responding',
            date: '16 Jan 2018',
            time: '15:08:43',
            text: '0x0a898…ga9s8 not responding',
            isFixed: true,
            fixedDate: '17 Jan 2018',
            fixedTime: '16:27:57',
            id: '451',
          },
          {
            type: 'Not responding',
            date: '18 Jan 2018',
            time: '15:08:43',
            text: '0x0a898…ga9s8 not responding',
            isFixed: true,
            fixedDate: '17 Jan 2018',
            fixedTime: '16:27:57',
            id: '451',
          },
          {
            type: 'Not responding',
            date: '16 Jan 2018',
            time: '15:08:43',
            text: '0x0a898…ga9s8 not responding',
            isFixed: false,
            fixedDate: '17 Jan 2018',
            fixedTime: '16:27:57',
            id: '451',
          },
          {
            type: 'Not responding',
            date: '18 Jan 2018',
            time: '15:08:43',
            text: '0x0a898…ga9s8 not responding',
            isFixed: false,
            fixedDate: '17 Jan 2018',
            fixedTime: '16:27:57',
            id: '451',
          },
        ]
      })
      s.complete()
    })

    $roomDataStream.subscribe(({ value }: any) => {
      commit('setErrors', value)
    })

    return $roomDataStream
  },
  async desyncMeterErrors ({ state }: Context) {
    const roomId = getRoomId(state.meta.roomName)
    destroyRoomDataStream(roomId)
  }
}
