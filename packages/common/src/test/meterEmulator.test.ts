import { assert, expect } from 'chai'
import BigNumber from 'bignumber.js'
import EmulatedMeter from '../meters/EmulatedMeter'
import { ConnectionKind } from '@onder/interfaces'

describe('Common_MeterEmulator', async function () {
  const meter = new EmulatedMeter(3, {
    kind: ConnectionKind.File,
    account: '123',
    password: '123',
    column: 'a',
    path: __dirname + '/test.emulatorData.csv'
  })

  it('should return BigNumber', async function () {
    const value = await meter.currentValue()
    return assert.instanceOf(value, BigNumber)
  })

  it('should return on of [12, 6, 32, ..., 66]', async function () {
    const value = await meter.currentValue()
    return expect(value.value.toNumber()).to.be.oneOf([12, 6, 32, 17, 21, 43, 59, 12, 17, 31, 19, 10, 20, 68, 19, 65, 42, 134, 106, 66])
  })
})
