import {
  IMeterValue,
  ResponseStatus,
  IMeterConfiguration } from '@onder/interfaces'
import mapper from './MeterTransportMapper'
import AddressService from '../AddressService'
import Logger from '../Logger'
import MeterTransport from './MeterTransport'
import { URL } from 'url'
import axios from 'axios'

const log = new Logger('meter-transport-client')

export default class MeterTransportClient {
  private readonly meterConfig: IMeterConfiguration
  private readonly addressService: AddressService
  private readonly workTimeout: number

  private _baseAddress?: URL
  private _valueEndpoint?: URL
  private _configurationEndpoint?: URL

  private isConfigSent: boolean = false
  private readonly proxy?: string

  constructor (workTimeout: number, proxy: string | undefined, addressService: AddressService, configuration: IMeterConfiguration) {
    this.workTimeout = workTimeout
    this.proxy = proxy
    this.addressService = addressService
    this.meterConfig = configuration
  }

  async sendMeterValue (values: IMeterValue[]): Promise<ResponseStatus> {
    if (!this.isConfigSent) {
      log.warn(`WARN: confing not sended`)
      return ResponseStatus.ConfigurationNotSet
    }

    try {
      let endpoint = await this.valueEndpoint()
      let body = mapper.meterValuesToJson(values)
      let response = await this.doRequest(endpoint, body)

      if (response.status === ResponseStatus.Success) {
        log.info('Send values. Status: ', response.statusCode, 'Values count:', values.length, 'first', values.length > 0 ? mapper.meterValuesToJson([values[0]]) : 'unknown')
      }

      return response.status
    } catch (er) {
      log.error('Error when send meter values count ', values.length, '. Error: ', er, 'first', values.length > 0 ? mapper.meterValuesToJson([values[0]]) : 'unknown')
      return ResponseStatus.Error
    }
  }

  async sendMeterConfiguration (configuration: IMeterConfiguration): Promise<ResponseStatus> {
    try {
      let endpoint = await this.configurationEndpoint()
      let response = await this.doRequest(endpoint, configuration)
      if (response.status === ResponseStatus.Success) {
        this.isConfigSent = true
        log.info(`Send config. Status: ${response.status}. Configuration: ${JSON.stringify(configuration)}`)
      }
      return response.status
    } catch (error) {
      log.error(`Error when send meter configuration: ${JSON.stringify(configuration)}`, error)
      return ResponseStatus.Error
    }
  }

  private async doRequest (endpoint: URL, body: object): Promise<any> {
    let timeout = this.workTimeout * 15
    log.debug(`Doing POST request to ${endpoint}`, body)
    let response = await axios.post(endpoint.toString(),{
      data: body,
      timeout: timeout
    })
    return response.data
  }

  private async baseAddress (): Promise<URL> {
    if (!this._baseAddress) {
      this._baseAddress = await this.addressService.resolve().meterTransport(this.meterConfig.account)
    }
    return this._baseAddress
  }

  private async valueEndpoint (): Promise<URL> {
    if (!this._valueEndpoint) {
      let baseAddress = await this.baseAddress()
      let endpoint = new URL(baseAddress.toString())
      endpoint.pathname = endpoint.pathname + MeterTransport.VALUE_END_POINT.replace(/^\//, '')
      this._valueEndpoint = endpoint
    }
    return this._valueEndpoint
  }

  private async configurationEndpoint (): Promise<URL> {
    if (!this._configurationEndpoint) {
      let baseAddress = await this.baseAddress()
      let endpoint = new URL(baseAddress.toString())
      endpoint.pathname = endpoint.pathname + MeterTransport.CONFIGURATION_END_POINT.replace(/^\//, '')
      this._configurationEndpoint = endpoint
    }
    return this._configurationEndpoint
  }
}
