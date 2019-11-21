import * as http from 'http'
import * as Koa from 'koa'
import * as koaLogger from 'koa-logger'
import * as bodyParser from 'koa-bodyparser'
import * as io from 'socket.io'
import { IMeterReaderCallback,
         IMeter,
         IMeterValue } from '@onder/interfaces'
import ProblemController from '../ProblemController'
import { BigNumber } from 'bignumber.js'
import VirtualMeterContainer from '../VirtualMeterContainer'
import Logger from '../Logger'
import VirtualMeter from '../VirtualMeter'
import { MetersController } from './MetersController'

const log = new Logger('web-server')

export default class WebServer {
  static NAMESPACE = '/socket'

  private readonly meters: VirtualMeterContainer
  readonly upstreamAccount: string
  private readonly server: http.Server
  readonly ioapp: io.Server
  readonly problemController: ProblemController
  private readonly port: number
  private readonly app: Koa
  private readonly host: string

  constructor (quantum: number, isSeller: boolean, defaultPrice: BigNumber, host: string, port: number, allowSendStatistic: boolean, meters: VirtualMeterContainer, upstreamAccount: string, problemController: ProblemController) {
    this.meters = meters
    this.upstreamAccount = upstreamAccount
    this.problemController = problemController
    this.port = port
    this.host = host

    this.app = new Koa()
    this.app.use(koaLogger((str, args) => {
      log.info(str, args)
    }))
    this.app.use(bodyParser())

    this.server = http.createServer(this.app.callback())
    this.ioapp = io(this.server, { path: '/api/v1' })
  }

  addMeterReaderRoom (account: string, room: IMeterReaderCallback) {
    log.info('Called WebServer#addMeterReaderRoom. Nope, not doing.')
  }

  removeMeterReaderRoom (account: string, room: IMeterReaderCallback) {
    log.info('Called WebServer#removeMeterReaderRoom. Nope, not doing.')
  }

  async addMeter (virtualMeter: VirtualMeter): Promise<void> {
    log.info('Called WebServer#addMeter. Adding API calls')
    const controller = new MetersController(virtualMeter)
    const router = controller.router()
    this.app.use(router.routes()).use(router.allowedMethods())
  }

  async notifyMeterValue (meter: IMeter, value: IMeterValue): Promise<void> {
    log.info('Called WebServer#notifyMeterValue. Nope, not doing.')
  }

  async start (): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.server.listen(this.port, this.host, () => {
        log.info(`Listening on ${this.host}:${this.port}`)
        resolve()
      })
    })
  }
}
