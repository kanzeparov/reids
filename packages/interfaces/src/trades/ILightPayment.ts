import { BigNumber } from 'bignumber.js'
import * as moment from 'moment'
import { webproto } from '../proto'

export enum PaymentState {
  no_response = 0,
  no_channel = 1,
  no_deposit = 2,
  off_chain = 3,
  on_chain = 4
}
export interface ILightPayment {
  readonly token: string
  readonly sender: string
  readonly receiver: string
  readonly power: BigNumber
  readonly price: BigNumber
  readonly datetime: moment.Moment
  readonly total: BigNumber
  readonly state: PaymentState
}

export class LightPaymentSerde {
  static serialize (value: ILightPayment) {
    return webproto.LightPayment.create({
      token: value.token,
      sender: value.sender,
      receiver: value.receiver,
      power: value.power.toString(),
      price: value.price.toString(),
      datetime: value.datetime.valueOf(),
      total: value.total.toString(),
      state: value.state
    })
  }
  static deserialize (obj: any): ILightPayment {
    const value = webproto.LightPayment.fromObject(obj)
    return {
      token: value.token,
      sender: value.sender,
      receiver: value.receiver,
      power: new BigNumber(value.power),
      price: new BigNumber(value.price),
      datetime: moment(value.datetime).utc(),
      total: new BigNumber(value.total),
      state: value.state
    }
  }
}
