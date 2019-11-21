import moment from 'moment'
import Logger from './Logger'

const log = new Logger('utils')

namespace Utils {
  export function round (n: number | string, afterPoint: number = 6): number {
    if (afterPoint <= 1) {
      log.error(`Not valid params for round! afterPoint = ${afterPoint}`)
      return Number(n)
    }
    if (typeof n === 'string') { // Some times sequalize returns string..
      return Number(n)
    }
    const mn = Math.pow(10, afterPoint)
    return Math.round(n * mn) / mn
  }

  export function generate_key () {
    let text = '0xgeeaed'
    const possible = 'abcdefg0123456789'

    while (text.length < 42) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return text
  }

  export function getConfigurationDir () {
    return process.env.CONFIGURATION_DIR ? process.env.CONFIGURATION_DIR + '/' : './'
  }

  export function intervalStart (workTimeout: number, now: moment.Moment = moment().utc()): moment.Moment {
    return moment(Math.floor(now.valueOf() / workTimeout) * workTimeout).utc()
  }
}

export default Utils
