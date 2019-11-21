import { Periods, rangeFromString, timeToday } from './Periods'
import * as moment from 'moment'

function timestamp (hh: number, mm: number) {
  return moment().utc().hour(hh).minute(mm).second(0).millisecond(0).date(1).month(0).year(1970)
}

const PEAK = [
  {
    from: '18:00',
    to: '23:00'
  }, {
    from: '07:00',
    to: '13:00'
  }
]

const MID_PEAK = [
  {
    from: '13:00',
    to: '18:00'
  }
]

const OFF_PEAK = [
  {
    from: '00:00',
    to: '07:00'
  },
  {
    from: '23:00',
    to: '00:00'
  }
]

describe('rangeFromString', () => {
  test('transform string to DateRange', () => {
    const range = {
      from: '00:00',
      to: '18:00'
    }
    const result = rangeFromString(range)
    expect(result.start.toString()).toBe(timestamp(0, 0).toString())
    expect(result.end.toString()).toBe(timestamp(18, 0).toString())
  })
})

describe('constructor', () => {
  test('set time ranges', async () => {
    const periods = new Periods(PEAK, MID_PEAK, OFF_PEAK)
    expect(periods.peak.length).toBe(2)
    expect(periods.peak[0].start.toString()).toBe(timestamp(18, 0).toString())
    expect(periods.peak[0].end.toString()).toBe(timestamp(23, 0).toString())
    expect(periods.peak[1].start.toString()).toBe(timestamp(7, 0).toString())
    expect(periods.peak[1].end.toString()).toBe(timestamp(13, 0).toString())

    expect(periods.midPeak.length).toBe(1)
    expect(periods.midPeak[0].start.toString()).toBe(timestamp(13, 0).toString())
    expect(periods.midPeak[0].end.toString()).toBe(timestamp(18, 0).toString())

    expect(periods.offPeak.length).toBe(2)
    expect(periods.offPeak[0].start.toString()).toBe(timestamp(0, 0).toString())
    expect(periods.offPeak[0].end.toString()).toBe(timestamp(7, 0).toString())
    expect(periods.offPeak[1].start.toString()).toBe(timestamp(23, 0).toString())
    expect(periods.offPeak[1].end.toString()).toBe(timestamp(0, 0).toString())
  })
})

describe('#kind', () => {
  const periods = new Periods(PEAK, MID_PEAK, OFF_PEAK)

  test('find peak', async () => {
    const kind = periods.kind(timestamp(19, 0).toDate())
    expect(kind).toBe(Periods.Kind.PEAK)
  })

  test('find mid-peak', async () => {
    const kind = periods.kind(timestamp(14, 0).toDate())
    expect(kind).toBe(Periods.Kind.MID_PEAK)
  })

  test('find off-peak', async () => {
    const kind = periods.kind(timestamp(6, 0).toDate())
    expect(kind).toBe(Periods.Kind.OFF_PEAK)
  })

  test('can not find', async () => {
    const periods = new Periods(PEAK, MID_PEAK, [])
    expect(() => {
      return periods.kind(timestamp(6, 0).toDate())
    }).toThrow()
  })
})

describe('#timeToday', () => {
  const today = timestamp(19, 0)

  test('parse today', () => {
    const t = timeToday(today.toDate())
    expect(t.toISOString()).toEqual(today.toISOString())
  })

  test('parse tomorrow', () => {
    const tomorrow = timestamp(19, 0).add(1, 'day')
    const t = timeToday(tomorrow.toDate())
    expect(t.toISOString()).toEqual(today.toISOString())
  })

  test('parse yesterday', () => {
    const yesterday = timestamp(19, 0).subtract(1, 'day')
    const t = timeToday(yesterday.toDate())
    expect(t.toISOString()).toEqual(today.toISOString())
  })
})
