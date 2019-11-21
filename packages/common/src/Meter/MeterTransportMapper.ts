import { Request } from 'express'
import moment from 'moment'
import BigNumber from 'bignumber.js'
import {
  IMeterValue,
  IMeterConfiguration
} from '@onder/interfaces'

export function meterValuesToJson (values: IMeterValue[]): object {
  try {
    return values.map((obj: IMeterValue) => {
      return {
        value: obj.value,
        delta: obj.delta,
        datetime: obj.datetime.valueOf()
      }
    })
  } catch (e) {
    throw new Error(`Invalid format: ${e}`)
  }
}

export function receiveMeterValues (req: Request): Array<IMeterValue> {
  const body = req.body.data

  try {
    return body.map((obj: any) => ({
      value: new BigNumber(obj.value),
      delta: new BigNumber(obj.delta),
      datetime: moment(obj.datetime).utc()
    }))
  } catch (e) {
    throw new Error(`Invalid format: ${e}`)
  }
}

export const receiveMeterConfiguration = (req: Request): IMeterConfiguration => {
  const body: any = req.body
  try {
    return {
      account: body.account,
      faultValue: new BigNumber(body.faultValue ? body.faultValue : 0)
    } as IMeterConfiguration
  } catch (e) {
    throw new Error(`Invalid format: ${e}`)
  }
}

export default {
  receiveMeterValues,
  receiveMeterConfiguration,
  meterValuesToJson
}
