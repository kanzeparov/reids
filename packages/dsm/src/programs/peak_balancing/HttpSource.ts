import axios from 'axios'
import { BigNumber } from 'bignumber.js'

export interface RawConsumptionElement {
  time: number
  value: string
}

export interface ConsumptionElement {
  time: number
  value: BigNumber
}

export type ConsumptionResponse = Array<RawConsumptionElement>

export class HttpSource {
  readonly address: string

  constructor (address: string) {
    this.address = address
  }

  async consumption (): Promise<Array<ConsumptionElement>> {
    const response = await axios.get<ConsumptionResponse>(this.address)
    return response.data.map(element => {
      return {
        time: element.time,
        value: new BigNumber(element.value)
      }
    })
  }
}
