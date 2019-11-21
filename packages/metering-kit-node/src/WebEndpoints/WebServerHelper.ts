import * as io from 'socket.io'
import WebServer from './WebServer'
import { WebEventName, webproto, ErrorResponse, protoEncode } from '@onder/interfaces'
import { ErrorFactory, ErrorSerializer } from '@onder/common'
import { processJoinRoomEvent } from './events/JoinRoom'
import { processExitRoomEvent } from './events/ExitRoom'
import { processExitAllRoomsEvent } from './events/ExitAllRooms'
import { processGetSettingsEvent } from './events/GetSettings'
import { processSaveSettingsEvent } from './events/SaveSettings'
import { processConfigurationEvent } from './events/Configuration'
import { processRoomsEvent } from './events/Rooms'
import { processDeleteErrorEvent } from './events/DeleteError'
import { BigNumber } from 'bignumber.js'
import VirtualMeterContainer from '../VirtualMeterContainer'
import Logger from '../Logger'

const log = new Logger('web-server-helper')

type Handler = (data: any) => Promise<Uint8Array>

function addEvent (type: WebEventName, socket: io.Socket, handler: Handler) {
  socket.on(type, async data => {
    try {
      let response = await handler(data)
      socket.emit(type, response)
    } catch (e) {
      log.error('Error on process ' + type, e)
      let error = await ErrorFactory.createInternalErrorError()
      if ('type' in e) {
        error = e
      }
      const response = protoEncode(webproto.ErrorResponse.create({
        error: ErrorSerializer.serializeError(error)
      }))
      socket.emit(ErrorResponse, response)
    }
  })
}

export async function initializeSockets (quantum: number, isSeller: boolean, defaultPrice: BigNumber, allowSendStatistic: boolean, upstreamAccount: string, meters: VirtualMeterContainer, webServer: WebServer, ioapp: io.Server) {
  ioapp.of(WebServer.NAMESPACE).on('connection', async socket => {
    addEvent(WebEventName.JoinRoom, socket, async data => {
      return processJoinRoomEvent(webServer, socket, data, meters, upstreamAccount)
    })
    addEvent(WebEventName.ExitRoom, socket, async data => {
      return processExitRoomEvent(socket, data)
    })
    addEvent(WebEventName.ExitAllRooms, socket, async () => {
      return processExitAllRoomsEvent(socket)
    })
    addEvent(WebEventName.GetSettings, socket, async () => {
      return processGetSettingsEvent()
    })
    addEvent(WebEventName.SaveSettings, socket, async () => {
      return processSaveSettingsEvent()
    })
    addEvent(WebEventName.Configuration, socket, async () => {
      return processConfigurationEvent(quantum, upstreamAccount, isSeller, defaultPrice, allowSendStatistic, meters)
    })
    addEvent(WebEventName.Rooms, socket, async () => {
      return processRoomsEvent()
    })
    addEvent(WebEventName.DeleteError, socket, async () => {
      return processDeleteErrorEvent()
    })

    try {
      await processRoomsEvent()
    } catch (err) {
      log.error('initializeSockets', err)
    }
  })
}
