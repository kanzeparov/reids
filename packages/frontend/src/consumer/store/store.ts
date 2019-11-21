import Vue from 'vue'
import Vuex, { Store, StoreOptions, ActionContext } from 'vuex'
import { getStoreAccessors } from 'vuex-typescript'

import { Observable, from } from 'rxjs'
import { map, mapTo, mergeMap } from 'rxjs/operators'

import {
  WebRoomName,
  RoomPeriod,
  IWebError,
  webproto,
  IErrorRoomResponse,
} from '@onder/interfaces'

import { RootState } from './types'

// import ErrorSerializer from '../../common/error_serializer'

Vue.use(Vuex)

type Context = ActionContext<RootState, RootState>

// class WebErrorSerde {
//   static async deserialize (value: webproto.IWebError): Promise<IWebError> {
//     return {
//       error: await ErrorSerializer.deserializeError(value.error),
//       from: value.from ? moment(value.from).utc() : undefined,
//       to: value.to ? moment(value.to).utc() : undefined
//     }
//   }
// }
//
// class ErrorRoomResponseSerde {
//   static async deserialize (value: webproto.ErrorRoomResponse): Promise<IErrorRoomResponse> {
//     const result = {
//       add: new Array(value.add.length),
//       remove: new Array(value.remove.length),
//       update: new Array(value.update.length)
//     }
//     let promises = new Array<Promise<void>>()
//     value.add.forEach((value: any, index: number) => {
//       promises.push(WebErrorSerde.deserialize(value).then((err) => {
//         result.add[index] = err
//       }))
//     })
//     value.remove.forEach((value: any, index: number) => {
//       promises.push(WebErrorSerde.deserialize(value).then((err) => {
//         result.remove[index] = err
//       }))
//     })
//     value.update.forEach((value: any, index: number) => {
//       promises.push(WebErrorSerde.deserialize(value).then((err) => {
//         result.update[index] = err
//       }))
//     })
//     await Promise.all(promises)
//     return result
//   }
// }

export const state: RootState = {
  loaderActive: false,
  menuState: false,
  serverTimeout: 5000,
  // errors: [],
}

export const getters = {
  account (_: RootState, getters: any): string {
    return getters['profile/account']
  },
  isSeller (_: RootState, getters: any): boolean {
    return getters['profile/isSeller']
  },
  getLoaderState (state: RootState): boolean {
    return state.loaderActive
  },
  getServerTimeout (state: RootState): number {
    return state.serverTimeout
  },
  getMenuState (state: RootState): boolean {
    return state.menuState
  },
  // getErrors (state: RootState): Array<IWebError> {
  //   return state.errors
  // },
}

export const mutations = {
  setLoaderVisibility (state: RootState, loaderState: boolean) {
    state.loaderActive = loaderState
  },
  setServerTimeout (state: RootState, timeout: number) {
    state.serverTimeout = timeout
  },
  setMenuState (state: RootState, newState: boolean) {
    state.menuState = newState
  },
  // setErrors (state: RootState, errors: any) {
  //   state.errors = state.errors.filter(containError => {
  //     const isPresent = errors.remove.findIndex((error: any) => {
  //       return error.error.type === containError.error.type &&
  //       error.from !== undefined && error.to !== undefined && containError.from !== undefined && containError.to !== undefined &&
  //       error.from.valueOf() === containError.from.valueOf()
  //     }) !== -1
  //     return !isPresent
  //   })
  //
  //   state.errors = state.errors.map(containError => {
  //     const index = errors.update.findIndex((error: any) => {
  //       return error.error.type === containError.error.type &&
  //       error.from !== undefined && error.to !== undefined && containError.from !== undefined && containError.to !== undefined &&
  //       error.from.valueOf() === containError.from.valueOf()
  //     })
  //     if (index === -1) {
  //       return containError
  //     }
  //     return errors.update[index]
  //   })
  //
  //   errors.add.forEach((error: any) => {
  //     state.errors.push(error)
  //   })
  //
  //   state.errors.sort((a, b) => {
  //     if (b.from && a.from) {
  //       return b.from.valueOf() - a.from.valueOf()
  //     }
  //     return 0
  //   })
  // }
}

export const actions = {
  // async getErrors ({ getters, commit }: Context) {
  //   const $socket = await initSocket()
  //   const roomId = getRoomId(WebRoomName.Errors, getters.account)
  //
  //   const $errorStream = $socket.listenRoom(roomId, WebRoomName.Errors)
  //   $socket.joinRoom(roomId, webproto.RoomType.Error, webproto.ErrorRoomRequest.create({
  //     type: webproto.RoomType.Error
  //   }))
  //
  //   $errorStream
  //     .pipe(
  //       mergeMap((r: any) => {
  //         return from(ErrorRoomResponseSerde.deserialize(r)).pipe(mapTo(r))
  //       })
  //     )
  //     .subscribe((errors: any) => {
  //       commit('setErrors', errors)
  //     })
  // },
}

const { read, commit, dispatch } = getStoreAccessors<RootState, RootState>('')

/*************************************************/
/* GETTERS */
/*************************************************/
export const readLoaderVisibility = read(getters.getLoaderState)
export const readServerTimeout = read(getters.getServerTimeout)
export const readMenuState = read(getters.getMenuState)
// export const readErrors = read(getters.getErrors)

/*************************************************/
/* MUTATIONS */
/*************************************************/
export const commitLoaderVisibility = commit(mutations.setLoaderVisibility)
export const commitServerTimeout = commit(mutations.setServerTimeout)
export const commitMenuState = commit(mutations.setMenuState)

/*************************************************/
/* ACTIONS */
/*************************************************/
// export const dispatchGetErrors = dispatch(actions.getErrors)
