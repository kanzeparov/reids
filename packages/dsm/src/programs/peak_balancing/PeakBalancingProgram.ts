import { BigNumber } from 'bignumber.js'
import { HttpSource } from './HttpSource'
import { Periods } from './Periods'
import { TimeRangeString } from './TimeRangeString'
import Logger from '../../Logger'
import { IPricingProgram } from '../../IPricingProgram'
import { TimeCache } from './TimeCache'
import { UnreachableError } from '../../UnreachableError'

export interface PeakBalancingProgramArgs {
  Wmax: string
  baseCost: string
  minCost: string
  maxCost: string
  peakTime: Array<TimeRangeString>
  semiPeakTime: Array<TimeRangeString>
  nightTime: Array<TimeRangeString>
  source: {
    http: string
  }
}

const log = new Logger('peak-balancing-plugin')

export class PeakBalancingProgram implements IPricingProgram {
  readonly periods: Periods
  readonly source: HttpSource
  readonly minCost: BigNumber
  readonly maxCost: BigNumber
  readonly Wmax: BigNumber
  readonly basePrice: BigNumber
  readonly averageConsumptionCache: TimeCache<Promise<BigNumber>>

  constructor (readonly args: PeakBalancingProgramArgs) {
    this.source = new HttpSource(args.source.http)
    this.periods = new Periods(args.peakTime, args.semiPeakTime, args.nightTime)
    this.minCost = new BigNumber(args.minCost)
    this.maxCost = new BigNumber(args.maxCost)
    this.basePrice = new BigNumber(args.baseCost)
    this.Wmax = new BigNumber(this.args.Wmax)
    this.averageConsumptionCache = new TimeCache(10)
  }

  async currentPrice (now?: Date): Promise<BigNumber> {
    const _now = now || new Date()
    const clearPrice = await this.clearPrice(_now)
    return this.keepPriceInMinMaxRange(clearPrice.round(0))
  }

  async keepPriceInMinMaxRange (price: BigNumber): Promise<BigNumber> {
    let minPrice = new BigNumber(this.minCost)
    let maxPrice = new BigNumber(this.maxCost)
    log.info('Calculated clear price', price.toString())
    log.info(`Window for price is ${minPrice.toString()} - ${maxPrice.toString()}`)

    if (price.lessThan(minPrice)) {
      log.info('Returning min price', minPrice.toString())
      return minPrice
    } else if (price.greaterThan(maxPrice)) {
      log.info('Returning max price', maxPrice.toString())
      return maxPrice
    } else {
      return price
    }
  }

  async clearPrice (timestamp: Date): Promise<BigNumber> {
    const kind = this.periods.kind(timestamp)
    switch (kind) {
      case Periods.Kind.PEAK:
        log.info(`Treating ${timestamp.toDateString()} as PEAK time`)
        return this.peakPrice()
      case Periods.Kind.MID_PEAK:
        log.info(`Treating ${timestamp.toDateString()} as MID-PEAK time`)
        return this.midPeakPrice()
      case Periods.Kind.OFF_PEAK:
        log.info(`Treating ${timestamp.toDateString()} as OFF-PEAK time`)
        return this.offPeakPrice()
      /* istanbul ignore next */
      default:
        throw new UnreachableError(kind)
    }
  }

  async peakPrice (): Promise<BigNumber> {
    try {
      const Wavg = await this.averageConsumption()
      return this.basePrice.mul(new BigNumber(1).plus(Wavg.div(this.Wmax)).pow(2))
    } catch (e) {
      return this.basePrice
    }
  }

  async midPeakPrice (): Promise<BigNumber> {
    try {
      const averageConsumption = await this.averageConsumption()
      return this.basePrice.mul(new BigNumber(1).plus(averageConsumption.div(this.Wmax)))
    } catch (e) {
      return this.basePrice
    }
  }

  async offPeakPrice (): Promise<BigNumber> {
    return this.basePrice
  }

  async averageConsumption (): Promise<BigNumber> {
    log.info('Getting average consumption')
    return this.averageConsumptionCache.use(async () => {
      const consumption = await this.source.consumption()
      const total = consumption.reduce((acc, element) => {
        return acc.plus(element.value)
      }, new BigNumber(0))
      const result = total.div(consumption.length)
      log.info(`Average consumption is ${result.toString()}`)
      return result
    })
  }
}
