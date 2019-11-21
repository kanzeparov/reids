import VirtualMeter from './VirtualMeter'
import { IMeterConfiguration } from '@onder/interfaces'
import { MeterFactory } from '@onder/common'
import VirtualMeterFactory from './VirtualMeterFactory'

type Iteratee <A> = (account: string, meter: VirtualMeter) => A

export default class VirtualMeterContainer {
  readonly meters: Readonly<Map<string, VirtualMeter>>

  static async build (configs: Array<IMeterConfiguration>, meterFactory: MeterFactory, virtualMeterFactory: VirtualMeterFactory): Promise<VirtualMeterContainer> {
    let promises = configs.map(config => {
      const reader = meterFactory.build(config)
      return virtualMeterFactory.build(config.account, reader, config.ideaId)
    })
    let virtualMeters = await Promise.all(promises)
    let meters = virtualMeters.reduce<Map<string, VirtualMeter>>((acc, m) => acc.set(m.account, m), new Map())
    return new VirtualMeterContainer(meters)
  }

  constructor (meters: Map<string, VirtualMeter>) {
    this.meters = Object.freeze(meters)
  }

  map <A> (fn: Iteratee<A>): Array<A> {
    return this.reduce<Array<A>>((acc, account, meter) => {
      return acc.concat([fn(account, meter)])
    }, [])
  }

  forEach (fn: Iteratee<void>): void {
    this.meters.forEach((meter, account) => {
      fn(account, meter)
    })
  }

  reduce <A> (fn: (acc: A, account: string, meter: VirtualMeter) => A, start: A): A {
    let result = start
    this.meters.forEach((meter, account) => {
      result = fn(result, account, meter)
    })
    return result
  }

  accounts (): Array<string> {
    return Array.from(this.meters.keys())
  }

  get (account: string): VirtualMeter | undefined {
    return this.meters.get(account)
  }
}
