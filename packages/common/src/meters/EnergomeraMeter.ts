import { BigNumber } from 'bignumber.js'
import { IMeter, IMeterValue, IMeterConfigurationEnergomera, IMeterTransportCallback } from '@onder/interfaces'
import Logger from '@machinomy/logger'
import Utils from '../Utils'

const SerialPort = require('serialport')
const gpio = require('gpio')

const log = new Logger('onder-common-meterhw')
const gpio17 = gpio.export(17, { direction: 'out', interval: 200 })

export default class EnergomeraMeter implements IMeter, IMeterTransportCallback {
  readonly configuration: IMeterConfigurationEnergomera

  private readonly port: any
  private readonly workTimeout: number

  constructor (workTimeout: number, conf: IMeterConfigurationEnergomera) {
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

  currentValue (): Promise<IMeterValue> {
    let _this = this
    return new Promise((resolve, reject) => {
      readCurrentPower(_this.port, (power: BigNumber) => {
        if (power) {
          const delta = power.div(3600000).mul(this.workTimeout).round(8)
          const currentValue = {
            value: power,
            delta: delta,
            datetime: Utils.intervalStart(this.workTimeout),
            id: new BigNumber(0)
          }
          resolve(currentValue)
        }
        reject()
      })
    })
  }

  turnOff (): Promise<boolean> {
    return Promise.resolve(false)
  }
  turnOn (): Promise<boolean> {
    return Promise.resolve(true)
  }
}

function closeSession (port: any, next: any) {
  let message = '\x01\x42\x30\x03\x75'
  port.write(message, (err: any) => {
    if (err) {
      log.error(`Can't close port ${port}: ${err.message}`)
    } else {
      next()
    }
  })
}

function readUntil (port: any, eol: any, next: any) {
  let buffer = Buffer.from('')

  function onData () {
    let chunk = port.read()
    if (chunk) {
      buffer = Buffer.concat([buffer, chunk], buffer.length + chunk.length)
      let EOL = eol(buffer)
      if (EOL) {
        port.removeAllListeners('readable')
        next(buffer)
      }
    }
  }

  port.on('readable', onData)
}

function openSession (port: any, next: any) {
  let message = '\x2F\x3F\x21\x0D\x0A'
  port.write(message, () => {
    let eolCondition = (buffer: any) => {
      return buffer.slice(-2, buffer.length).toString() === Buffer.from('\x0D\x0A').toString()
    }
    readUntil(port, eolCondition, next)
  })
}

function setupGrab (port: any, next: any) {
  let message = '\x06050\x0D\x0A'
  port.write(message, () => {
    let eolCondition = (buffer: any) => {
      return buffer.slice(-4, -1).toString() === Buffer.from('\x0D\x0A\x03').toString()
    }
    readUntil(port, eolCondition, next)
  })
}

function readCurrentPower (port: any, callback: any) {
  closeSession(port, () => {
    openSession(port, () => {
      setupGrab(port, (data: any) => {
        let stringData = data.toString()
        let match = stringData.match(/POWEP\((\d+\.\d+)\)/)
        if (match[0]) {
          let powerValue = new BigNumber(match[1])
          callback(powerValue)
        }
        callback()
      })
    })
  })
}
