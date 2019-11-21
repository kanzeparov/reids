import express from 'express'
import bodyParser from 'body-parser'
import { body, validationResult } from 'express-validator/check'
import { IMeterConfiguration, ResponseStatus, IMeterConfigurationHTTPServer } from '@onder/interfaces'
import mapper from './MeterTransportMapper'
import AddressService from '../AddressService'
import Logger from '../Logger'
import MeterTransport from './MeterTransport'
import { TypedEventEmitter } from '@elderapo/typed-event-emitter'
import * as http from 'http'

const log = new Logger('meter-transport-server')

export default class MeterTransportServer extends TypedEventEmitter<MeterTransport.Events> {
  private server: http.Server
  private readonly app: express.Application
  private readonly port: number
  private readonly meterConfig: IMeterConfiguration
  private readonly addressService: AddressService
  private readonly workTimeout: number
  private readonly proxy?: string

  constructor (workTimeout: number, proxy: string | undefined, meterConfig: IMeterConfigurationHTTPServer, addressService: AddressService) {
    super()
    this.meterConfig = meterConfig
    this.port = this.meterConfig.port
    this.workTimeout = workTimeout
    this.proxy = proxy
    this.addressService = addressService
    this.app = express()
    this.app.use(bodyParser.json())
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (err instanceof SyntaxError) {
        res.status(400).send({
          status: ResponseStatus.Error,
          message: 'invalid json.'
        })
      }
      next()
    })
    this.routes()
    this.server = http.createServer(this.app)
  }

  start (): void {
    this.server.listen(this.port, () => {
      log.info(`Listening on port ${this.port}!`)
    })
    this.addressService.announce().meterTransport(this.meterConfig.account, this.port)
  }

  stop (): void {
    this.server.close()
  }

  private routes (): void {
    const router = express.Router()
    router.post(MeterTransport.VALUE_END_POINT, this.meterValueRoute.bind(this))
    router.post(MeterTransport.CONFIGURATION_END_POINT, this.meterConfigurationRoute.bind(this))

    router.use((req, res) => {
      res.status(404).send('Not Found')
    })
    router.use((err: any, req: express.Request, res: express.Response) => {
      log.error(err)
      res.status(500).send({
        status: ResponseStatus.Error,
        message: 'Error, something went wrong. See console or logs.'
      })
    })

    this.app.use(router)
  }

  private async meterValueRoute (req: express.Request, res: express.Response): Promise<void> {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).send({ status: ResponseStatus.Error, errors: errors.array() })
      return
    }

    const meterValues = mapper.receiveMeterValues(req)
    this.emit(MeterTransport.Event.METER_VALUE, { configuration: this.meterConfig, values: meterValues })
    const responseStatus = ResponseStatus.Success
    log.info('status: ' + responseStatus + '. Values count: ' + meterValues.length, 'first', meterValues.length > 0 ? mapper.meterValuesToJson([meterValues[0]]) : 'unknown')
    res.send({
      status: responseStatus
    })
  }

  private async meterConfigurationRoute (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).send({ status: ResponseStatus.Error, errors: errors.array() })
      return
    }

    const meterConfiguration = mapper.receiveMeterConfiguration(req)
    this.emit(MeterTransport.Event.METER_CONFIGURATION, meterConfiguration)
    res.send({
      status: ResponseStatus.Success
    })
  }
}
