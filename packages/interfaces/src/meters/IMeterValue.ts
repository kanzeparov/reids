import { BigNumber } from 'bignumber.js'
import * as moment from 'moment'
import { webproto } from '../proto'

export interface ILightMeterValue {
  readonly value: BigNumber
  readonly delta: BigNumber
  readonly datetime: moment.Moment
}

export interface IMeterValue extends ILightMeterValue {
  id: BigNumber
}

// Contract data types
export interface IMeterMqttBaseValue {
  id: string,
  port: number,
  mode: number,
  amount: number,
  seller: string,
  contragent: string,
  cost: number,
  timeStamp: string,
  approved?: boolean
}

// 40 107 6 32 33 34 35 115
export interface IMeterMqttEasyBaseValue {
  value: number,
  timeStamp: string,
  senderId?: string
}

// 101 105 111 117
export interface IMeterMqttEasyBaseStatus {
  value: boolean,
  timeStamp: string,
  senderId?: string
}

// 60 63 62 65
export interface IMeterMqttEasyBaseString {
  value: string,
  timeStamp: string,
  senderId?: string
}

export interface IMeterMqttProgressValue extends IMeterMqttBaseValue {
  progress?: number,
  payment_state?: boolean
}

// Known agents data types
export interface IMeterMqttPassportValue {
  ethereum_wallet: string
}

export interface IMeterMqttIdValue {
  agentId: string,
  passport: IMeterMqttPassportValue
}

export interface IMeterMqttAgentsValue {
  timeStamp: string,
  agentId: string,
  passport: IMeterMqttPassportValue,
  known_agents: Array<IMeterMqttIdValue>
}

export class LightMeterValueSerde {
  static serialize (value: ILightMeterValue) {
    return webproto.LightMeterValue.create({
      datetime: value.datetime.valueOf(),
      delta: value.delta.toString(),
      value: value.value.toString()
    })
  }
  static deserialize (obj: any): ILightMeterValue {
    const value = webproto.LightMeterValue.fromObject(obj)
    return {
      datetime: moment(value.datetime).utc(),
      delta: new BigNumber(value.delta),
      value: new BigNumber(value.value)
    }
  }
}
