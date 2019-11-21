import { IMeterValue } from '@onder/interfaces'
import * as express from 'express'
import * as moment from 'moment'

/**
 * Actually it just attaches /zeroreader to get the last value.
 */
export default class ZeroReader {
  private lastValue?: IMeterValue

  setLastValue (value: IMeterValue): void {
    this.lastValue = value
  }

  routes (): express.Router {
    let r = express.Router()
    r.get('/last', (req: express.Request, res: express.Response, next: express.NextFunction): void => {
      res.status(200).send(JSON.stringify({
        lastValue: this.lastValue,
        now: moment().utc().toISOString()
      }))
    })
    return r
  }
}
