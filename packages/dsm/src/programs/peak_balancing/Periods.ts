import * as Moment from 'moment'
import { extendMoment, DateRange } from 'moment-range'
import { TimeRangeString } from './TimeRangeString'

const moment = extendMoment(Moment)

export function anchoredTimestamp (hhmm: string) {
  return `1970-01-01T${hhmm}Z`
}

export function rangeFromString (range: TimeRangeString): DateRange {
  const from = anchoredTimestamp(range.from)
  const to = anchoredTimestamp(range.to)
  const isoString = `${from}/${to}`
  return moment.rangeFromISOString(isoString)
}

export function timeToday (timestamp: Date | string): Moment.Moment {
  const parsed = moment(timestamp).utc()
  const result = parsed
    .date(1)
    .month(0)
    .year(1970)
    .milliseconds(0)
  if (result.utc().date() !== 1 || result.utc().month() !== 0 || result.utc().year() !== 1970) {
    return timeToday(result.toISOString())
  } else {
    return result
  }
}

export class Periods {
  peak: Array<DateRange>
  midPeak: Array<DateRange>
  offPeak: Array<DateRange>

  constructor (peak: Array<TimeRangeString>, midPeak: Array<TimeRangeString>, offPeak: Array<TimeRangeString>) {
    this.peak = peak.map(rangeFromString)
    this.midPeak = midPeak.map(rangeFromString)
    this.offPeak = offPeak.map(rangeFromString)
  }

  kind (timestamp: Date): Periods.Kind {
    const input = timeToday(timestamp)
    const isContainer = (range: DateRange) => range.contains(input)
    if (this.peak.some(isContainer)) {
      return Periods.Kind.PEAK
    } else if (this.midPeak.some(isContainer)) {
      return Periods.Kind.MID_PEAK
    } else if (this.offPeak.some(isContainer)) {
      return Periods.Kind.OFF_PEAK
    } else {
      throw new Error(`Provided intervals does not contain timestamp ${input}`)
    }
  }
}

export namespace Periods {
  export enum Kind {
    PEAK,
    MID_PEAK,
    OFF_PEAK
  }
}
