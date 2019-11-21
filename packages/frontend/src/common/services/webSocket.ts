import Logger from './logger'
import { once } from 'lodash'
import { WebEventName, webproto, ErrorResponse, WebRoomName, protoEncode, protoDecode } from '@onder/interfaces'
import * as io from 'socket.io-client'
import config from './config'
import ErrorSerializer from '../../common/error_serializer'
import { Observable, Subscriber } from 'rxjs'

interface IRoom {
  roomID: string
  type: webproto.RoomType
  params: webproto.PartnerRoomRequest |
    webproto.PaymentsRoomRequest |
    webproto.PartnersRoomRequest |
    webproto.BalanceRoomRequest |
    webproto.MeasurementsRoomRequest |
    webproto.ErrorRoomRequest
}

interface IErrors {
  [errorName: string]: (args: any) => Error
}

const errors: IErrors = {
  roomAlreadyExists: (args: any): Error => Error(
    `Room already exists for args: ${JSON.stringify(args)}`
  ),
  socketNotDefined: (args: any): Error => Error(
    `Socket is undefined for args: ${JSON.stringify(args)}`
  ),
}

const $log = new Logger('onder-frontend-socket-service')

const getSocketIO = once((): Promise<SocketIOClientStatic> => {
  return new Promise((resolve, reject) => {
    const body = document.querySelector('body')
    if (!body) throw new Error()
    const scriptIO = document.createElement('script')
    scriptIO.src = `${config.baseURL}api/${config.apiVersion}/socket.io.js`
    document.body.appendChild(scriptIO)
    scriptIO.onload = () => {
      io ? resolve(io) : reject()
    }
    scriptIO.onerror = (err) => {
      reject(err)
    }
  })
})

/* This file exists only as a backup, just in case. */
/* Was replaced with 'websocket-client.ts' */
/* Date of stale: 21.10.2018 */

export default class WebSocket {
  private signedRooms: IRoom[] = []
  private socket?: SocketIOClient.Socket

  async init (): Promise<void> {
    let ioService = await getSocketIO()
    this.socket = await this.connectToSocket(ioService)
    this.initErrorHandler()
  }

  reInit (): void {
    this.signedRooms.forEach(room => {
      this.joinRoom(room.roomID, room.type, room.params)
    })
  }

  logUndefinedSocket () {
    $log.error('Socket in undefined')
    return
  }

  initErrorHandler (): void {
    if (!this.socket) return this.logUndefinedSocket()
    this.socket.on(ErrorResponse, async (error: any) => {
      const errorData = protoDecode<webproto.ErrorResponse>(webproto.ErrorResponse, error)
      const errorObj = await ErrorSerializer.deserializeError(errorData.error)
      $log.error(`Given error ${errorObj.type}: ${JSON.stringify(errorObj)}`)
    })
  }

  connectToSocket (io: SocketIOClientStatic): Promise<SocketIOClient.Socket> {
    return new Promise((resolve, reject) => {
      const socket = io.connect(`${config.baseURL}socket`, {
        path: `/api/${config.apiVersion}`
      })
      socket.on('reconnect', () => {
        this.reInit()
      })
      socket.on('connect', async () => {
        return resolve(socket)
      })
      socket.on('connect_error', (err: Error) => {
        return reject(err)
      })
      socket.on('connect_timeout', () => {
        return reject('Connection with socket is timeout.')
      })
    })
  }

  findSignedRoom (roomID: string): number {
    return this.signedRooms.findIndex(room => room.roomID === roomID)
  }

  sendEvent (eventName: WebEventName, params: any): Observable<any> {
    if (!this.socket) {
      this.logUndefinedSocket()
      throw errors.socketNotDefined({ eventName })
    }

    return new Observable(($observable: Subscriber<any>) => {
      this.socket!.on(eventName, (response: any) => {
        try {
          let data: any = undefined
          switch (eventName) {
            case WebEventName.JoinRoom:
              data = protoDecode(webproto.JoinRoomEventResponse, response)
              break
            case WebEventName.ExitRoom:
              data = protoDecode(webproto.ExitRoomEventResponse, response)
              break
            case WebEventName.ExitAllRooms:
              data = protoDecode(webproto.ExitAllRoomsEventResponse, response)
              break
            case WebEventName.GetSettings:
              data = protoDecode(webproto.GetSettingsEventResponse, response)
              break
            case WebEventName.SaveSettings:
              data = protoDecode(webproto.SaveSettingsEventResponse, response)
              break
            case WebEventName.Configuration:
              data = protoDecode(webproto.ConfigurationEventResponse, response)
              break
            case WebEventName.Rooms:
              data = protoDecode(webproto.RoomsEventResponse, response)
              break
            case WebEventName.DeleteError:
              data = protoDecode(webproto.DeleteErrorEventResponse, response)
              break
            default:
              throw new Error('Unknown response type')
          }

          $observable.next(data)
          $observable.complete()
        } catch (err) {
          $log.error(err)
        }
      })

      const data: Uint8Array = protoEncode(params)
      this.socket!.emit(eventName, data)
    })
  }

  listenRoom (roomID: string, roomType: WebRoomName): Observable<any> {
    if (this.findSignedRoom(roomID) > -1) {
      throw errors.roomAlreadyExists({ roomID })
    }

    if (!this.socket) {
      this.logUndefinedSocket()
      throw errors.socketNotDefined({ roomID })
    }

    return new Observable(($observable: Subscriber<any>) => {
      this.socket!.on(roomID, (response: any) => {
        try {
          if (!(roomType in webproto.RoomType)) {
            throw new Error('Unsupported room type')
          }

          let data: any = undefined
          switch (roomType) {
            case WebRoomName.Partners:
              data = protoDecode(webproto.PartnersRoomResponse, response)
              break
            case WebRoomName.Balance:
              data = protoDecode(webproto.BalanceRoomResponse, response)
              break
            case WebRoomName.Measurements:
              data = protoDecode(webproto.MeasurementsRoomResponse, response)
              break
            case WebRoomName.Errors:
              data = protoDecode(webproto.ErrorRoomResponse, response)
              break
            case WebRoomName.Partner:
              data = protoDecode(webproto.PartnerRoomResponse, response)
              break
            case WebRoomName.Payments:
              data = protoDecode(webproto.PaymentsRoomResponse, response)
              break
            case WebRoomName.Transactions:
              data = protoDecode(webproto.TransactionsRoomResponse, response)
              break
            default:
              throw new Error('Unknown response type')
          }

          $observable.next(data)
        } catch (err) {
          $log.error(err)
        }
      })
    })
  }

  leaveRoom (roomId: string): void {
    if (!this.socket) {
      this.logUndefinedSocket()
      throw errors.socketNotDefined({ roomId })
    }
    const RoomForDelete = this.findSignedRoom(roomId)

    if (RoomForDelete > -1) {
      this.signedRooms.splice(RoomForDelete, 1)
    } else {
      return
    }

    this.socket.emit(WebEventName.ExitRoom, {
      roomID: roomId
    })
  }

  leaveAllRoom (): void {
    if (!this.socket) return this.logUndefinedSocket()
    this.signedRooms = []
    this.socket.emit(WebEventName.ExitAllRooms)
  }

  joinRoom (roomID: string, type: webproto.RoomType, params: any): void {
    if (this.findSignedRoom(roomID) === -1) {
      this.signedRooms.push({
        roomID,
        type,
        params
      })
    }
    if (!this.socket) return this.logUndefinedSocket()
    let binaryRequest = protoEncode(params)
    this.socket.emit(WebEventName.JoinRoom, protoEncode(webproto.JoinRoomEventRequest.create({
      roomID: roomID,
      type: type,
      roomEventRequest: binaryRequest
    })))
  }
}
