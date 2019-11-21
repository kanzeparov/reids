import {
  IMeter,
  IMeterValue,
  IMeterMqttBaseValue,
  IMeterMqttProgressValue,
  IMeterMqttEasyBaseValue,
  IMeterMqttAgentsValue,
  IMeterMqttEasyBaseString,
  IMeterMqttEasyBaseStatus
} from '@onder/interfaces'
import { TypedEventEmitter } from '@elderapo/typed-event-emitter'

interface IMeterReader extends TypedEventEmitter<IMeterReader.Events> {
  meter: IMeter
  start (): void
  stop (): void
  sendGenType? (value: string): void
  sendGenParameter? (value: number, num: number): void
  sendAmigoUnloadStatus? (value: boolean): void
  sendLoadPriority? (value: string): void
  sendMasStratMode? (value: string): void
  sendTradeSupport? (value: boolean): void
  sendFinance? (value: string): void
  sendKnownAgents? (value: string): void
}

namespace IMeterReader {
  export enum Event {
    Init,
    Read,
    Progress,
    NewAgent,
    BatteryPower,
    EmeterPower,
    AmigoPrice,
    PowerFromEnodeAndPort,
    ValueFromEnodeAndLoad,
    StatusFromEnodeRelay,
    StatusFromRelay,
    TypeGen,
    ParametrGen,
    AmigoStatus,
    LoadValue,
    LoadType,
    Strategy,
    TradeStatus,
    Connected
  }

  export type Events = {
    [Event.Connected]: boolean,
    [Event.Init]: {
      approve: (value: IMeterMqttBaseValue) => void,
      meter: IMeter, value: IMeterMqttBaseValue
    },
    [Event.Progress]: {
      approve: (value: IMeterMqttProgressValue) => void,
      meter: IMeter, value: IMeterMqttProgressValue
    },
    [Event.BatteryPower]: {
      approve: (value: IMeterMqttEasyBaseValue) => void,
      meter: IMeter, value: IMeterMqttEasyBaseValue
    },
    [Event.NewAgent]: {
      answer: (value: string) => void,
      meter: IMeter, value: IMeterMqttAgentsValue
    },
    [Event.EmeterPower]: {
      approve: (value: IMeterMqttEasyBaseValue) => void,
      meter: IMeter, value: IMeterMqttEasyBaseValue
    },
    [Event.AmigoPrice]: {
      approve: (value: IMeterMqttEasyBaseValue) => void,
      meter: IMeter, value: IMeterMqttEasyBaseValue
    },
    [Event.PowerFromEnodeAndPort]: {
      approve: (value: IMeterMqttEasyBaseValue) => void,
      meter: IMeter, value: IMeterMqttEasyBaseValue
    },
    [Event.ValueFromEnodeAndLoad]: {
      approve: (value: IMeterMqttEasyBaseValue) => void,
      meter: IMeter, value: IMeterMqttEasyBaseValue
    },
    [Event.StatusFromEnodeRelay]: {
      approve: (value: IMeterMqttEasyBaseStatus) => void,
      meter: IMeter, value: IMeterMqttEasyBaseStatus
    },
    [Event.StatusFromRelay]: {
      approve: (value: IMeterMqttEasyBaseStatus) => void,
      meter: IMeter, value: IMeterMqttEasyBaseStatus
    },
    [Event.TypeGen]: {
      approve: (value: IMeterMqttEasyBaseString) => void,
      meter: IMeter, value: IMeterMqttEasyBaseString
    },
    [Event.ParametrGen]: {
      approve: (value: IMeterMqttEasyBaseValue) => void,
      meter: IMeter, value: IMeterMqttEasyBaseValue
    },
    [Event.AmigoStatus]: {
      approve: (value: IMeterMqttEasyBaseStatus) => void,
      meter: IMeter, value: IMeterMqttEasyBaseStatus
    },
    [Event.LoadValue]: {
      approve: (value: IMeterMqttEasyBaseString) => void,
      meter: IMeter, value: IMeterMqttEasyBaseString
    },
    [Event.LoadType]: {
      approve: (value: IMeterMqttEasyBaseString) => void,
      meter: IMeter, value: IMeterMqttEasyBaseString
    },
    [Event.Strategy]: {
      approve: (value: IMeterMqttEasyBaseString) => void,
      meter: IMeter, value: IMeterMqttEasyBaseString
    },
    [Event.TradeStatus]: {
      approve: (value: IMeterMqttEasyBaseStatus) => void,
      meter: IMeter, value: IMeterMqttEasyBaseStatus
    },
    [Event.Read]: { meter: IMeter, value: IMeterValue }
  }
}

export default IMeterReader
