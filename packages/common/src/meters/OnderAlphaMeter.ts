import { BigNumber } from 'bignumber.js'
import { IMeter, IMeterValue, IMeterTransportCallback } from '@onder/interfaces'
import Logger from './Logger'
import Utils from '../Utils'
import SerialPort from './onderAlpha/SerialPort'
import { Mutex } from 'await-semaphore'
import _ from 'lodash'

const log = new Logger('onder-alpha')

const gpio = require('gpio')
const gpio17 = gpio.export(17, { direction: 'out', interval: 200 })

export class OnderAlphaMeter {
  private readonly workTimeout: number
  private readonly serialPort: SerialPort
  private readonly port: string
  private reading: Mutex = new Mutex()

  constructor (workTimeout: number, conf: any) {
    this.port = conf.port
    this.workTimeout = workTimeout
    this.serialPort = new SerialPort(this.port)

    this.init().then(() => {
      this.setStatus(true)
    }).catch((reason) => {
      log.error(`Can't init ${this.port}: ${reason}`)
    })
  }

  private async init (): Promise<void> {
    await this.serialPort.open()
    let query = '03100001000a14 0001 0002 0003 0001 0002 0003 0001 0002 0003 0001'
    await this.serialPort.askHex(query, b => b.length === 8)
  }

  setStatus (value: any) {
    if (value) {
      gpio17.set()
    } else {
      gpio17.set(0)
    }
  }

  async currentValue (): Promise<Array<IMeterValue>> {
    return this.reading.use(async () => {
      let lastValues = await readCurrentPower(this.serialPort)
      return lastValues.map(result => {
        const delta = result.div(3600000).mul(this.workTimeout).round(8)
        return {
          value: result,
          delta: delta,
          datetime: Utils.intervalStart(this.workTimeout),
          id: new BigNumber(0)
        }
      })
    })
  }
}

export class MeterOnderAlphaChild implements IMeter, IMeterTransportCallback {
  readonly configuration: any

  private parent: OnderAlphaMeter

  constructor (parent: OnderAlphaMeter, configuration: any) {
    this.parent = parent
    this.configuration = configuration
  }

  currentValue (): Promise<IMeterValue> {
    throw new Error('Not Implemented')
    // return this.parent.currentValue(this.configuration.index)
  }

  async turnOff (): Promise<boolean> {
    return false
  }

  async turnOn (): Promise<boolean> {
    return true
  }
}

async function afterTimeout<A> (timeout: number, fn: () => Promise<A>): Promise<A> {
  return new Promise<A>((resolve, reject) => {
    setTimeout(() => fn().then(resolve).catch(reject), timeout)
  })
}

function readings (response: Buffer, count: number, offset: number): Array<BigNumber> {
  return _.times(count).map(i => {
    let value = response.readInt16BE(offset + i * 2)
    return new BigNumber(value)
  })
}

async function readCurrentPower (port: SerialPort): Promise<Array<BigNumber>> {
  return afterTimeout(200, async () => {
    const query = '0303 0001 0024'
    const response = await port.askHex(query, b => b.length >= 3 && b.length === b[2] + 5)

    const preambleLength = 3
    const voltage = readings(response, 3, preambleLength).map(v => v.div(100))
    const current = readings(response, 10, preambleLength + 6).map(v => v.div(100))
    const activePower = readings(response, 10, preambleLength + 26)
    const fullPower = readings(response, 10, preambleLength + 46)
    log.debug(`Read values from ${port.path} voltage, V: ${JSON.stringify(voltage)}`)
    log.debug(`Read values from ${port.path} current, A: ${JSON.stringify(current)}`)
    log.debug(`Read values from ${port.path}  active, W: ${JSON.stringify(activePower)}`)
    log.debug(`Read values from ${port.path}    full, W: ${JSON.stringify(fullPower)}`)

    return fullPower
  })
}
