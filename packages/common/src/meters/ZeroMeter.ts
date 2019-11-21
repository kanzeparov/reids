import { BigNumber } from 'bignumber.js'
import { IMeter, IMeterValue, IMeterConfigurationZero, IMeterTransportCallback } from '@onder/interfaces'
import Utils from '../Utils'

export default class ZeroMeter implements IMeter, IMeterTransportCallback {
  readonly configuration: IMeterConfigurationZero

  private readonly workTimeout: number

  constructor (workTimeout: number, configuration: IMeterConfigurationZero) {
    this.workTimeout = workTimeout
    this.configuration = configuration
  }

  async currentValue (): Promise<IMeterValue> {
    const value = new BigNumber(0)
    const delta = value.div(3600000).mul(this.workTimeout).round(8)

    return {
      value: value,
      delta: delta,
      datetime: Utils.intervalStart(this.workTimeout),
      id: new BigNumber(0)
    }
  }

  async turnOff (): Promise<boolean> {
    return false
  }

  async turnOn (): Promise<boolean> {
    return true
  }
}
