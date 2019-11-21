import { store } from './index'
import { WebRoomName, RoomPeriod } from '@onder/interfaces'

export const initSocket = async (): Promise<any> => {
  const $socket = await store.dispatch('socket/init')
  return $socket
}

export const getRoomId = (roomName: WebRoomName, period?: RoomPeriod): string => {
  const account: string = store.getters.account
  const roomId: string = `${roomName}_${account}`

  return period ? `${roomId}_${period}` : roomId
}
