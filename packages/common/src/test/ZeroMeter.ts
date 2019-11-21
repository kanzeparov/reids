import { assert } from 'chai'
import { ConnectionKind } from '@onder/interfaces'
import BigNumber from 'bignumber.js'
import ZeroMeter from '../meters/ZeroMeter'

describe('Common_MeterZero', async function () {
  const meter = new ZeroMeter(3, {
    kind: ConnectionKind.Zero,
    account: '123'
  })

  it('should return BigNumber', async function () {
    const value = await meter.currentValue()
    return assert.instanceOf(value, BigNumber)
  })

  it('should return zero', async function () {
    const value = await meter.currentValue()
    return assert.isTrue(value.value.isZero())
  })
})
