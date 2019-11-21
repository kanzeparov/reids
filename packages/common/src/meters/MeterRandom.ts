import BigNumber from 'bignumber.js'
import { IMeter, IMeterValue, IMeterConfigurationRandom, IMeterTransportCallback } from '@onder/interfaces'
import Utils from '../Utils'

export default class MeterRandom implements IMeter, IMeterTransportCallback {
  readonly configuration: IMeterConfigurationRandom

  private readonly workTimeout: number

  constructor (workTimeout: number, configuration: IMeterConfigurationRandom) {
    this.configuration = configuration
    this.workTimeout = workTimeout
  }

  async currentValue (): Promise<IMeterValue> {
    const value = new BigNumber(Utils.round(Math.random()))
    const delta = value.div(3600000).mul(this.workTimeout).round(8)

    return {
      value: value,
      delta: delta,
      datetime: Utils.intervalStart(this.workTimeout),
      id: new BigNumber(0)
    }
  }

  turnOff (): Promise<boolean> {
    return Promise.resolve(false)
  }
  turnOn (): Promise<boolean> {
    return Promise.resolve(true)
  }

}
