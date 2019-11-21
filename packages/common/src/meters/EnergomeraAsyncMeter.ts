import { BigNumber } from 'bignumber.js'
import { IMeter, IMeterValue, IMeterConfigurationEnergomeraAsync, IMeterTransportCallback } from '@onder/interfaces'
import { Buffer } from 'safe-buffer'
import Logger from '@machinomy/logger'
import Utils from '../Utils'
import SerialPort from 'serialport'

const gpio = require('gpio')

const log = new Logger('onder-common-meterhw')
const gpio17 = gpio.export(17, { direction: 'out', interval: 200 })

type EolCondition = (buffer: Buffer) => boolean

export default class EnergomeraAsyncMeter implements IMeter, IMeterTransportCallback {
  readonly configuration: IMeterConfigurationEnergomeraAsync

  private readonly port: any
  private readonly workTimeout: number

  constructor (workTimeout: number, conf: IMeterConfigurationEnergomeraAsync) {
    this.configuration = conf
    this.workTimeout = workTimeout

    this.port = new SerialPort(conf.port, {
      baudRate: 9600,
      parity: 'even',
      dataBits: 7
    }, (err: any) => log.error(`Can't serialPort: ${err.message}`))
    const _this = this
    this.port.once('open', (err: any) => {
      if (err) {
        log.error(`Can't open port ${_this.port}: ${err.message}`)
      }
    })
    this.setStatus(true)
  }

  setStatus (value: any) {
    if (value) {
      gpio17.set()
    } else {
      gpio17.set(0)
    }
  }

  async currentValue (): Promise<IMeterValue> {
    const power = await readCurrentPower(this.port)
    const delta = power.div(3600000).mul(this.workTimeout).round(8)
    return {
      value: power,
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

function closeSession (port: any): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let message = '\x01\x42\x30\x03\x75'
    port.write(message, (err: any) => {
      if (err) {
        log.error(`Can't close port ${port}: ${err.message}`)
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

function readUntil (port: any, eol: EolCondition): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    let buffer = Buffer.alloc(0)
    port.on('readable', () => {
      let chunk = port.read()
      if (chunk) {
        buffer = Buffer.concat([buffer, chunk], buffer.length + chunk.length)
        if (eol(buffer)) {
          port.removeAllListeners('readable')
          resolve(buffer)
        }
      }
    })
    port.on('error', (error: any) => {
      reject(error)
    })
  })
}

async function openSession (port: any): Promise<void> {
  const message = '\x2F\x3F\x21\x0D\x0A'
  await write(port, message)
  await readUntil(port, buffer => {
    return buffer.slice(-2, buffer.length).toString() === Buffer.from('\x0D\x0A').toString()
  })
}

function write (port: any, message: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    port.write(message, (error: any) => {
      error ? reject(error) : resolve()
    })
  })
}

async function setupGrab (port: any): Promise<Buffer> {
  const message = '\x06050\x0D\x0A'
  await write(port, message)
  return readUntil(port, buffer => {
    return buffer.slice(-4, -1).toString() === Buffer.from('\x0D\x0A\x03').toString()
  })
}

async function readCurrentPower (port: any): Promise<BigNumber> {
  await closeSession(port)
  await openSession(port)
  const data = setupGrab(port)
  let stringData = data.toString()
  let match = stringData.match(/POWEP\((\d+\.\d+)\)/)
  if (match && match[0]) {
    return new BigNumber(match[1])
  } else {
    throw new Error('Can not read current power')
  }
}
