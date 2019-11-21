import { BigNumber } from 'bignumber.js'
import * as fs from 'fs'
import { IMeter, IMeterValue, IMeterConfigurationFile, IMeterTransportCallback } from '@onder/interfaces'
import Utils from '../Utils'

const csv = require('csv-parser')

function loadData (path: string, column: string): Promise<Array<number>> {
  return new Promise<Array<number>>((resolve, reject) => {
    let result: Array<number> = []
    fs.createReadStream(path)
      .pipe(csv({ separator: ';' }))
      .on('data', (data: any) => {
        if (data[column]) {
          result.push(data[column])
        }
      })
      .on('error', (error: any) => {
        reject(error)
      })
      .on('end', () => {
        resolve(result)
      })
  })
}

export default class EmulatedMeter implements IMeter, IMeterTransportCallback {
  readonly configuration: IMeterConfigurationFile

  private readonly data: Promise<Array<number>>
  private readonly workTimeout: number

  constructor (workTimeout: number, configuration: IMeterConfigurationFile) {
    this.configuration = configuration
    this.workTimeout = workTimeout

    this.data = loadData(this.configuration.path, this.configuration.column)
  }

  async currentValue (): Promise<IMeterValue> {
    const data = await this.data
    const index = Math.floor((new Date().getSeconds() / 30) * 10)
    if (data[index]) {
      const value = new BigNumber(data[index])
      const delta = value.div(3600000).mul(this.workTimeout).round(8)
      return {
        value: value,
        delta: delta,
        datetime: Utils.intervalStart(this.workTimeout),
        id: new BigNumber(0)
      }
    } else {
      throw new Error(`Can not read data for index ${index}`)
    }
  }

  turnOff (): Promise<boolean> {
    return Promise.resolve(false)
  }
  turnOn (): Promise<boolean> {
    return Promise.resolve(true)
  }
}
