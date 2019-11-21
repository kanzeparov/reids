import { Observable, Subject } from 'rxjs'
import { takeUntil, finalize } from 'rxjs/operators'

import websocket from '@/common/services/websocket-client'
import { IRoom } from '@/common/services/websocket-client/types'

const streamStoppers = new Map()

export function createRoomDataStream (room: IRoom, pipes: any[] = []) {
  const $streamStopper: Subject<any> = new Subject()

  const { roomId } = room
  streamStoppers.set(roomId, $streamStopper)

  const $dataStream: Observable<any> = websocket.listenRoom(room)
  return $dataStream.pipe.call(
    $dataStream,
    ...pipes,
    takeUntil($streamStopper),
    finalize(() => websocket.leaveRoom(room))
  )
}

export function destroyRoomDataStream (roomId: string) {
  const $streamStopper: Subject<any> = streamStoppers.get(roomId)
  $streamStopper.next()
  $streamStopper.complete()
}
