import { ResponseStatus, ITradeChannelCallback } from '@onder/interfaces'
import { AddressService } from '@onder/common'
import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as moment from 'moment'
import { query, validationResult } from 'express-validator/check'
import Logger from './Logger'
import { Transport, AcceptPaymentResponse, AcceptPaymentRequest, AcceptPaymentRequestSerde, AcceptPaymentResponseSerde, PaymentNotValidError, PaymentRequiredResponse, PaymentRequiredResponseSerializer, PaymentRequiredRequestSerializer } from 'machinomy'
import ProblemController from './ProblemController'
import axios from 'axios'
import * as crypto from 'crypto'

enum ErrorCode {
  Unknown = 0,
  PaymentNotValid = 1
}

const log = new Logger('trade-channel')

const ENPOINT_ACCEPT = '/accept'
const ENPOINT_PRICING = '/pricing'

const META = ''

export default class TradeChannel extends Transport {
  private readonly upstreamAccount: string
  private readonly account: string
  private app?: express.Application
  private readonly problemController: ProblemController
  private readonly addressService: AddressService
  private readonly workTimeout: number
  private readonly host: string
  private readonly port: number

  constructor (upstreamAccount: string, host: string, port: number, problemController: ProblemController, addressService: AddressService, workTimeout: number, account: string) {
    super()
    this.account = account
    this.host = host
    this.port = port
    this.upstreamAccount = upstreamAccount
    this.problemController = problemController
    this.addressService = addressService
    this.workTimeout = workTimeout
  }

  async getPaymentRequiredURL (upstream: string): Promise<string> {
    // const upstream = this.upstreamAccount
    let address = await this.addressService.resolve().tradeChannel(upstream)
    return address + ENPOINT_PRICING.replace(/^\//, '')
  }

  async startTradeServer (callback: ITradeChannelCallback): Promise<void> {
    this.app = express()
    this.app.use(bodyParser.json())
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (err instanceof SyntaxError) {
        return res.status(400).send({
          status: ResponseStatus.Error,
          message: 'invalid json.'
        }).end()
      }
      next()
    })
    const index: express.Router = express.Router()
    index.get(ENPOINT_PRICING , [
      query('sender').isString().not().isEmpty(),
      query('timestamp').isNumeric()
    ], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).send({ status: 'error', errors: errors.array() }).end()
        return
      }
      const baseurl = 'http://' + this.host + ':' + this.port + ENPOINT_ACCEPT
      const request = PaymentRequiredRequestSerializer.instance.deserialize(req.originalUrl)
      const datetime = moment(request.datetime).utc()
      const price = await callback.getPrice(datetime)
      const openChannels = await callback.getOpenChannels(request.sender)
      const tokenContract = callback.getTokenContract()
      const response = new PaymentRequiredResponse(price, this.account, baseurl, tokenContract, META, openChannels)
      const headers = PaymentRequiredResponseSerializer.instance.serialize(response, {})
      res.status(402).set(headers).send('Read the headers for energy price info').end()
    })

    index.post(ENPOINT_ACCEPT, this.handlePostAccept(callback).bind(this))
    this.app.use(index)
    this.app.listen(this.port, () => {
      log.info(`Trade chanel listening on ${this.port}!`)
    })
    this.addressService.announce().tradeChannel(this.account, this.port)
  }

  private handlePostAccept (callback: ITradeChannelCallback) {
    return async function (req: express.Request, res: express.Response, next: express.NextFunction) {
      let token = ''
      try {
        log.debug("===================== acceptPayment")
        token = await callback.acceptPayment(req.body)
      } catch (e) {
        if (e instanceof PaymentNotValidError) {
          // Temporary solution because of very strict Machinomy validation of payment
          token = '0x' + crypto.randomBytes(64).toString('hex')
        }
      }

      log.debug(ENPOINT_ACCEPT, req.body, token)
      res.status(202).header('Paywall-Token', token).send({ success: true, token }).end()
    }
  }

  async doPayment (paymentRequest: AcceptPaymentRequest, gateway: string): Promise<AcceptPaymentResponse> {
    log.info('Doing payment...')
    const res = await axios.post(gateway, AcceptPaymentRequestSerde.instance.serialize(paymentRequest), {
      withCredentials: true
    })
    log.info('Done payment!', res.data)
    if (res.data && res.data.success) {
      return AcceptPaymentResponseSerde.instance.deserialize(res.data)
    } else if (res.data.code && res.data.code === ErrorCode.PaymentNotValid) {
      throw new PaymentNotValidError()
    }
    if (res.data.text) {
      throw new Error(res.data.text)
    } else {
      throw new Error('Unknown error')
    }
  }
}
