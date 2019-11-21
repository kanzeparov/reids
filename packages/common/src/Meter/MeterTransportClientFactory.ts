import AddressService from '../AddressService'
import { IMeterConfiguration } from '@onder/interfaces'
import MeterTransportClient from './MeterTransportClient'

export default class MeterTransportClientFactory {
  private readonly quantum: number
  private readonly proxy: string
  private readonly addressService: AddressService

  constructor (quantum: number, proxy: string, addressService: AddressService) {
    this.quantum = quantum
    this.proxy = proxy
    this.addressService = addressService
  }

  build (configuration: IMeterConfiguration): MeterTransportClient {
    return new MeterTransportClient(this.quantum, this.proxy, this.addressService, configuration)
  }
}
