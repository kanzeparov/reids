import { assert, expect } from 'chai'
import BigNumber from 'bignumber.js'
import MeterRandom from '../meters/MeterRandom'
import { ConnectionKind } from '@onder/interfaces'

describe('Common_MeterRandom', async function () {
  const meter = new MeterRandom(3, {
    kind: ConnectionKind.Random,
    account: '123',
    password: '123'
  })

  it('should return BigNumber', async function () {
    const value = await meter.currentValue()
    return assert.instanceOf(value, BigNumber)
  })

  it('should return 2 not equals values', async function () {
    const currentValue1 = await meter.currentValue()
    const value1 = currentValue1.value
    const currentValue2 = await meter.currentValue()
    const value2 = currentValue2.value
    return assert.isNotTrue(value1.equals(value2))
  })
})
