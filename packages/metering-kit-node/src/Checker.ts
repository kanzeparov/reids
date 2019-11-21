import {
  IMachinomy,
  IMeterValue,
  ITrade,
  ILightPayment,
  PaymentState,
  WASTED_ADDRESS
} from '@onder/interfaces'

import { ErrorFactory, Utils, MeterValue, LightPayment } from '@onder/common'
import { BigNumber } from 'bignumber.js'
import Logger from '@machinomy/logger'
import * as moment from 'moment'
import ProblemController from './ProblemController'
import Seller from './Seller'
import NodeDatabase from './nodeDatabase/nodeDatabase'

const log = new Logger('onder-metering-kit-node-checker')

const checkAttemptBeforeError = 5

interface ICheckResult {
  idsDownstreamMeters: string[]
  idsUpstreamMeters: string[]
  incomeTheoretical: BigNumber
  incomePractice: BigNumber
  powerTheoretical: BigNumber
  powerPractice: BigNumber
  percent: BigNumber
}

interface IQueueItem {
  time: moment.Moment
  i: number
}

function isAcceptable (res: ICheckResult) {
  let isLeaf = res.idsDownstreamMeters.length === 0
  let isConverge = res.incomeTheoretical.equals(res.incomePractice)
  return (isLeaf || isConverge)
}

function sum<A> (elements: Array<A>, fn: (a: A) => BigNumber): BigNumber {
  return elements.reduce<BigNumber>((acc, e) => acc.plus(fn(e)), new BigNumber(0))
}

export default class Checker {
  private readonly account: string
  private db: NodeDatabase
  private machinomy: IMachinomy
  private checkQueue: Array<IQueueItem> = []
  private busy: boolean = false
  private readonly problemController: ProblemController
  private readonly workTimeout: number
  private seller: Seller

  constructor (workTimeout: number, account: string, problemController: ProblemController, db: NodeDatabase, machinomy: IMachinomy, seller: Seller) {
    this.account = account
    this.db = db
    this.machinomy = machinomy
    this.problemController = problemController
    this.workTimeout = workTimeout
    this.seller = seller
  }

  private async calculatePower (from: moment.Moment, to: moment.Moment) {
    const measurements: Array<MeterValue> = await this.db.requests.getMeasurements(from, to)
    return measurements.reduce((delta, value) => {
      return delta.add(value.delta)
    }, new BigNumber(0))
  }

  private async calculateDownstreamMeters (to: moment.Moment): Promise<Array<string>> {
    const from = to.clone().subtract(10 * this.workTimeout + 1, 'ms')
    const lastPayments: Array<LightPayment> = await this.db.requests.getPayments(from, to)
    const result = lastPayments.reduce<Array<string>>((meters, value) => {
      const notSelf = value.sender !== this.account
      const notIncluded = !meters.includes(value.receiver)
      if (notSelf && notIncluded) {
        meters.push(value.sender)
      }
      return meters
    }, new Array<string>())
    return result
  }

  private async check (from: moment.Moment): Promise<ICheckResult> {
    const to = from.clone().add(this.workTimeout - 1, 'ms')
    const power = await this.calculatePower(from, to)
    const price = await this.db.requests.getPrice(from)
    log.debug(`Checker.checkTIme: powerByTime: ${from.toISOString()} price: ${price} power: ${power.toFixed(15)}`)
    let payments: Array<LightPayment> = await this.db.requests.getPayments(from, to)
    let idsUpstreamMeters = await this.machinomy.upstreamAccounts()
    let idsDownstreamMeters = await this.calculateDownstreamMeters(to)
    let actualMoney = sum(payments, p => p.price)
    let sumPower = sum(payments, p => p.power)
    let expectedMoney = power.times(price)
    let percent = new BigNumber(100).minus(sumPower.times(100).div(power)).abs()
    log.debug('Checker.checkTime: percent: ', percent.toString())
    return {
      idsDownstreamMeters,
      idsUpstreamMeters,
      incomeTheoretical: expectedMoney,
      incomePractice: actualMoney,
      powerPractice: sumPower,
      powerTheoretical: power,
      percent
    }
  }

  private saveToQueue (item: IQueueItem) {
    let isPresent = this.checkQueue.find(value => item.time.valueOf() === value.time.valueOf())
    if (!isPresent) {
      this.checkQueue.push(item)
    }
  }

  public addToCheck (values: IMeterValue[]) {
    values.forEach(value => this.saveToQueue({ time: value.datetime, i: 0 }))
  }

  private async secondCheckerTimed (value: IQueueItem, forDelete: Array<number>) {
    let check = undefined
    const from = value.time
    try {
      check = await this.check(from)
    } catch (e) {
      log.error('Check error', from.toISOString(), e)
      if (value.i === checkAttemptBeforeError) {
        await this.markAsIncorrect(from, check).catch((reason) => {
          log.error('markAsCorrect', from.toISOString(), reason)
        })
      } else {
        value.i++
      }
      return
    }
    log.debug('Checker.job: check', {
      idsDownstreamMeters: check.idsDownstreamMeters, // string[]
      idsUpstreamMeters: check.idsUpstreamMeters, // string[]
      incomeTheoretical: check.incomeTheoretical.toString(), // BigNumber
      incomePractice: check.incomePractice.toString(), // BigNumber
      powerTheoretical: check.powerTheoretical.toString(), // BigNumber
      powerPractice: check.powerPractice.toString(), // BigNumber
      percent: check.percent.toString() // BigNumber
    })
    let ok = false
    if (check) {
      if (isAcceptable(check)) {
        log.debug('income is ok', from.toISOString())
        ok = true
      }
      if (ok) {
        forDelete.push(value.time.valueOf())
        await this.markAsCorrect(from).catch((reason) => {
          log.error('markAsCorrect', from.toISOString(), reason)
        })
      } else if (value.i === checkAttemptBeforeError) {
        await this.markAsIncorrect(from, check).catch((reason) => {
          log.error('markAsCorrect', from.toISOString(), reason)
        })
        log.error('Income is wrong', from.toISOString(), check.incomeTheoretical.toString(), check.incomePractice.toString(), check)
        forDelete.push(value.time.valueOf())
      } else {
        value.i++
      }
    }
  }

  private async secondChecker (value: IQueueItem, forDelete: Array<number>) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject('timeout ' + value.time.valueOf())
      }, this.workTimeout)
      this.secondCheckerTimed(value, forDelete).then(() => {
        clearTimeout(timeout)
        resolve()
      }).catch(reason => {
        clearTimeout(timeout)
        reject(reason)
      })
    })
  }

  private async onShotWorker (from: moment.Moment) {
    let res = undefined
    try {
      res = await this.check(from)
    } catch (e) {
      log.error('Check error', from.toISOString(), e)
    }

    if (res) {
      if (isAcceptable(res)) {
        log.debug('income is ok', from.toISOString())

        await this.markAsCorrect(from).catch((reason) => {
          log.error('markAsCorrect', from.toISOString(), reason)
        })
      } else {
        this.saveToQueue({ time: from, i: 0 })
      }
    } else {
      this.saveToQueue({ time: from, i: 0 })
    }

    if (this.checkQueue.length > 0) {
      let forDelete: Array<number> = []
      const promises = this.checkQueue.map((value) => {
        return this.secondChecker(value, forDelete)
      })
      try {
        await Promise.all(promises)
      } catch (e) {
        log.error('error when check', e)
      }
      this.checkQueue = this.checkQueue.filter((elem) => {
        return forDelete.indexOf(elem.time.valueOf()) < 0
      })
    }
  }
  private async oneShot () {
    let workTimeout = this.workTimeout
    const from = Utils.intervalStart(workTimeout).subtract(workTimeout * 2, 'ms') // check for 2 interval back
    // sometimes we have a frozen previous run. I don't know why
    if (this.busy) {
      this.saveToQueue({ time: from, i: 0 })
      return
    }
    this.busy = true
    try {
      await this.onShotWorker(from)
    } catch (e) {
      log.error('Worker failed', e)
    }
    this.busy = false
  }

  start () {
    setInterval(this.oneShot.bind(this), this.workTimeout)
  }

  private async markAsCorrect (dt: moment.Moment) {
    const payment: ILightPayment = {
      datetime: dt,
      power: new BigNumber(0),
      price: new BigNumber(0),
      receiver: this.account,
      sender: WASTED_ADDRESS,
      state: PaymentState.no_response,
      token: '',
      total: new BigNumber(0)
    }
    let error = await ErrorFactory.createCheckError(new BigNumber(0), new BigNumber(0), dt, this.account)
    await this.problemController.async_resolveProblem(error)
    await this.seller.addPayment(payment)
  }

  private async markAsIncorrect (dt: moment.Moment, checkResult: ICheckResult | undefined) {
    let account = this.account
    let error = undefined
    if (checkResult) {
      let power = checkResult.powerTheoretical.minus(checkResult.powerPractice)
      if (power.lt(0)) { // In normal situation we can't have a <0 values
        log.warn('Power <0')
        power = power.abs()
      }
      const payment: ILightPayment = {
        datetime: dt,
        power: power,
        price: new BigNumber(0),
        receiver: this.account,
        sender: WASTED_ADDRESS,
        state: PaymentState.no_response,
        token: '',
        total: new BigNumber(0)
      }
      error = await ErrorFactory.createCheckError(checkResult.incomeTheoretical, checkResult.incomePractice, dt, account)
      await this.problemController.async_problemReport(error)
      await this.seller.addPayment(payment)
    } else {
      error = await ErrorFactory.createCheckError(new BigNumber(0), new BigNumber(0), dt, account)
      await this.problemController.async_problemReport(error)
    }
  }

  queuePayment (payment: ILightPayment): void {
    const isFake = payment.sender === WASTED_ADDRESS
    if (isFake) {
      return
    }
    this.saveToQueue({ time: payment.datetime, i: 0 })
  }

  queueTrade (trade: ITrade): void {
    this.saveToQueue({ time: trade.getMeasurement().datetime, i: 0 })
  }
}
