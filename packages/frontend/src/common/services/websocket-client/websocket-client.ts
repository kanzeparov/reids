import * as io from 'socket.io-client'
import { Observable, Subscriber } from 'rxjs'

import ErrorSerializer from '@/common/error_serializer'

import Logger from '@/common/services/logger'
const $log = new Logger('websocket-service')

import {
  WebEventName,
  webproto,
  ErrorResponse,
  protoEncode,
  protoDecode,
} from '@onder/interfaces'

import { IRoom } from './types'
import ProtoHelpers from './proto-helpers'

import config from '@/common/services/config'
const url = `${config.baseURL}socket`
const path = `/api/${config.apiVersion}`

export default class WebSocketClient {
  rooms: IRoom[] = []
  isConnecting: boolean = false
  socket: SocketIOClient.Socket
  $connectionEventsStream: Observable<any>
  connectionStatus: Promise<any>

  constructor () {
    this.isConnecting = true
    this.socket = io.connect(url, { path })
    this.$connectionEventsStream = this._initConnectionEvents()
    this.connectionStatus = this._initStatusCheck()

    this.socket.on('disconnect', () => {
      $log.info(`Disconnected from websocket on ${url}${path}`)
    })
  }

  async connect () {
    if (this.isConnecting) {
      return this.connectionStatus
    }

    if (this.socket.connected) {
      return this.socket
    }

    if (this.socket.disconnected) {
      this.socket.open()
      this.connectionStatus = this._initStatusCheck()

      return this.connectionStatus
    }

    return this.connectionStatus
  }

  /* websocket events */

  sendEvent (eventName: WebEventName, eventRequest: any): Promise<any> {
    return new Observable(($subscriber: Subscriber<any>) => {
      this.socket.on(eventName, (rawResponse: any) => {
        try {
          const response = ProtoHelpers.decodeEventResponse(eventName, rawResponse)
          $subscriber.next(response)
          $subscriber.complete()
        } catch (err) {
          $log.error(err)
        }
      })

      const data: Uint8Array = protoEncode(eventRequest)
      this.socket.emit(eventName, data)
    }).toPromise()
  }

  /* websocket rooms */

  findRoom ({ roomId }: IRoom): IRoom | undefined {
    return this.rooms.find((room: IRoom) => room.roomId === roomId)
  }

  listenRoom (room: IRoom): Observable<any> {
    const { roomId, roomName } = room

    return new Observable(($subscriber: Subscriber<any>) => {
      this.socket.on(roomId, (rawResponse: any) => {
        try {
          const response = ProtoHelpers.decodeRoomResponse(roomName, rawResponse)
          $subscriber.next(response)
        } catch (err) {
          $log.error(err)
        }
      })

      this.joinRoom(room)
    })
  }

  joinRoom (room: IRoom) {
    if (!this.findRoom(room)) {
      this.rooms = [ ...this.rooms, room ]
    }

    this.socket.emit(WebEventName.JoinRoom, ProtoHelpers.joinRoomRequest(room))
  }

  leaveRoom (room: IRoom) {
    if (!this.findRoom(room)) {
      return
    }

    this.rooms = this.rooms.filter(({ roomId }: IRoom) => roomId !== room.roomId)
    this.socket.emit(WebEventName.ExitRoom, ProtoHelpers.exitRoomRequest(room))
  }

  /* private methods */

  private _initConnectionEvents () {
    return new Observable((subscriber: Subscriber<any>) => {
      this.socket.on('connect', () => {
        $log.info(`Connected to websocket on ${url}${path}`)

        this.rooms.forEach(this.joinRoom.bind(this))
        subscriber.next({})
      })

      this.socket.on('reconnecting', (retriesCount: number) => {
        $log.info(`Reconnecting to websocket #${retriesCount}...`)
      })

      this.socket.on('reconnect_error', (error: Error) => {
        $log.error(`Failed to reconnect to websocket, error: ${error}`)
        subscriber.next({ error })
      })

      this.socket.on('connect_error', (error: Error) => {
        $log.error(`Failed to connect to websocket, error: ${error}`)
        subscriber.next({ error })
      })

      this.socket.on('connect_timeout', (timeout: any) => {
        $log.error(`Failed to connect to websocket due to timeout, error: ${timeout}`)
        subscriber.next({ error: timeout })
      })
    })
  }

  private async _initStatusCheck () {
    let $sub: any = null

    const statusPromise = new Promise((resolve, reject) => {
      $sub = this.$connectionEventsStream.subscribe((status: any) => {
        this.isConnecting = false
        return status.error ? reject(status.error) : resolve()
      })
    })

    return statusPromise
      .then(() => ($sub.unsubscribe(), this._initErrorHandler(), this.socket))
      .catch((error: any) => ($sub.unsubscribe(), Promise.reject(error)))
  }

  private _initErrorHandler () {
    this.socket.on(ErrorResponse, async (error: any) => {
      const errorData = protoDecode<webproto.ErrorResponse>(webproto.ErrorResponse, error)
      const errorObj = await ErrorSerializer.deserializeError(errorData.error)
      $log.error(`Given error ${errorObj.type}: ${JSON.stringify(errorObj)}`)
    })
  }
}
