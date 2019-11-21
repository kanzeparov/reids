import { assert, expect } from 'chai'
import BigNumber from 'bignumber.js'
import moment from 'moment'
import { ConnectionKind, IMeterValue } from '@onder/interfaces'
import Configuration from '../Configuration/Configuration'
import MeterReader from '../Meter/MeterReader'
import EmulatedMeter from '../meters/EmulatedMeter'
import IMeterReader from '../Meter/IMeterReader'

const WORK_TIMEOUT = 3

describe('Common_MeterReader', async function () {
  process.env['ACCOUNT'] = 'test'
  process.env['WORKTIMEOUT'] = '170'
  const meterEmulator = new EmulatedMeter(3, {
    kind: ConnectionKind.File,
    account: '123',
    password: '123',
    column: 'b',
    path: __dirname + '/test.emulatorData.csv'
  })

  it('Should get measurement with value instanceOf BigNumber, delta instanceOf BigNumber, datetime instanceOf moment', function (done) {
    const reader = new MeterReader(meterEmulator, WORK_TIMEOUT)
    let value: IMeterValue

    reader.on(IMeterReader.Event.Read, payload => {
      value = payload.value
    })

    reader.start()

    setTimeout(() => {
      assert.instanceOf(value.value, BigNumber)
      assert.instanceOf(value.delta, BigNumber)
      assert.instanceOf(value.datetime, moment)
      reader.stop()
      done()
    }, 200)
  })

  it('Should get measurement value = BigNumber 2 and delta BigNumber 0.00166667 (workTimeout=170)', async function () {
    process.env['WORKTIMEOUT'] = '170'
    const configuration = new Configuration()
    await configuration.init()
    const reader = new MeterReader(meterEmulator, WORK_TIMEOUT)
    let value: IMeterValue

    reader.on(IMeterReader.Event.Read, payload => {
      value = payload.value
    })

    reader.start()

    await new Promise((resolve) => {
      setTimeout(() => {
        assert.equal(value.value.toNumber(), 2)
        assert.equal(value.delta.toNumber(), 0.00009444)
        reader.stop()
        resolve()
      }, 200)
    })
  })

  it('Should get measurement with datetime before now and after second ago', function (done) {
    const reader = new MeterReader(meterEmulator, WORK_TIMEOUT)
    let value: IMeterValue

    reader.on(IMeterReader.Event.Read, payload => {
      value = payload.value
    })

    reader.start()

    setTimeout(() => {
      assert.isTrue(value.datetime.isBefore(moment()))
      assert.isTrue(value.datetime.isAfter(moment().subtract(1, 'seconds')))

      reader.stop()
      done()
    }, 200)
  })

  it('Should get above 9 measurements in 200 milliseconds (workTimeout=20)', async function () {
    let readerCount = 0
    process.env['WORKTIMEOUT'] = '20'
    const configuration = new Configuration()
    await configuration.init()
    const reader = new MeterReader(meterEmulator, WORK_TIMEOUT)

    reader.on(IMeterReader.Event.Read, () => {
      readerCount++
    })

    reader.start()

    await new Promise((resolve) => {
      setTimeout(() => {
        expect(readerCount).to.be.above(9)
        reader.stop()
        resolve()
      }, 250)
    })
  })

  it('Should get measurements with time interval 15 milliseconds (workTimeout=15)', async function () {
    const workTimeout = 15
    let measurementsTimestamp: number[] = []
    process.env['WORKTIMEOUT'] = workTimeout.toString()
    const configuration = new Configuration()
    await configuration.init()
    const reader = new MeterReader(meterEmulator, WORK_TIMEOUT)

    reader.on(IMeterReader.Event.Read, payload => {
      const timestamp = payload.value.datetime.valueOf()
      measurementsTimestamp.push(timestamp)
    })

    reader.start()

    await new Promise((resolve) => {
      setTimeout(() => {
        reader.stop()
        const arr = measurementsTimestamp.reverse()
        const firstDate = arr.splice(0,1)
        let gaps = 0

        arr.forEach((current, index, array) => {
          const prev = array[--index] || firstDate
          gaps += +prev - +current
        })

        const average = gaps / measurementsTimestamp.length
        expect(average).to.be.below(workTimeout + 10)

        resolve()
      }, 200)
    })

  })

})
