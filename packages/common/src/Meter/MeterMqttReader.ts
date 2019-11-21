import { TypedEventEmitter } from '@elderapo/typed-event-emitter'
import Logger from '../Logger'
import IMeterReader from './IMeterReader'
import {
  IMeterMqttBaseValue,
  IMeterValue,
  IMeterMqttProgressValue,
  IMeterMqttAgentsValue,
  IMeterMqttEasyBaseValue,
  IMeterMqttEasyBaseString,
  IMeterMqttEasyBaseStatus
} from '@onder/interfaces'
import MeterMQTT from './MeterMqtt'

const log = new Logger('meter-reader')

export default class MeterMqttReader extends TypedEventEmitter<IMeterReader.Events> implements IMeterReader {
  readonly meter: MeterMQTT

  constructor (meter: MeterMQTT) {
    super()
    this.meter = meter
    this.meter.on(MeterMQTT.Event.INIT_RCVD, async value => {
      await this._init_request(value)
    })
    this.meter.on(MeterMQTT.Event.PROGRESS_RCVD, async value => {
      await this._progress_request(value)
    })
    this.meter.on(MeterMQTT.Event.AGENT_RCVD, async value => {
      await this._new_agent(value)
    })
    this.meter.on(MeterMQTT.Event.BATTERY_POWER_RCVD, async value => {
      await this._init_battery_power(value)
    })
    this.meter.on(MeterMQTT.Event.EMETER_POWER_RCVD, async value => {
      await this._init_emeter_power(value)
    })
    this.meter.on(MeterMQTT.Event.PRICE_AMIGO_RCVD, async value => {
      await this._init_amigo_price(value)
    })
    this.meter.on(MeterMQTT.Event.POWER_ENODE_PORT_RCVD, async value => {
      await this._init_enode_port_power(value)
    })
    this.meter.on(MeterMQTT.Event.POWER_ENODE_LOAD_RCVD, async value => {
      await this._init_enode_load_power(value)
    })
    this.meter.on(MeterMQTT.Event.STATUS_ENODE_RELAY_RCVD, async value => {
      await this._status_enode_relay_power(value)
    })
    this.meter.on(MeterMQTT.Event.STATUS_ROUTER_RCVD, async value => {
      await this._status_relay_power(value)
    })
    this.meter.on(MeterMQTT.Event.STATUS_CONNECTED, async value => {
      await this.emit(IMeterReader.Event.Connected, value)
    })
  }

  async _new_agent (value: IMeterMqttAgentsValue): Promise<void> {
    this.emit(IMeterReader.Event.NewAgent, {
      answer: this._answer.bind(this),
      meter: this.meter, value: value
    })
  }

  async sendKnownAgents (value: string): Promise<void> {
    this.meter.sendKnownAgent(value)
  }

  async _answer (value: string): Promise<void> {
    this.meter.sendKnownAgent(value)
  }

  async _progress_request (value: IMeterMqttProgressValue): Promise<void> {
    this.emit(IMeterReader.Event.Progress, {
      approve: this.approve_progress.bind(this),
      meter: this.meter, value: value
    })
  }

  approve_progress (value: IMeterMqttProgressValue): void {
    this.meter.send_approve_progress(value)
  }

  sendGenType (val: string): void {
    const value = {
      value: val,
      timeStamp: new Date().toISOString()
    }
    this.meter.send_gen_type(value)
  }

  sendGenParameter (val: number , gen: number): void {
    const value = {
      value: val,
      timeStamp: new Date().toISOString()
    }
    this.meter.send_gen_parametr(value, gen)
  }

  sendAmigoUnloadStatus (val: boolean): void {
    const value = {
      value: val,
      timeStamp: new Date().toISOString()
    }
    this.meter.send_amigo_unload_status(value)
  }

  sendLoadPriority (val: string): void {
    const value = {
      value: val,
      timeStamp: new Date().toISOString()
    }
    this.meter.send_load_priority(value)
  }

  sendMasStratMode (val: string): void {
    const value = {
      value: val,
      timeStamp: new Date().toISOString()
    }
    this.meter.send_mas_strat_mode(value)
  }

  sendTradeSupport (val: boolean): void {
    const value = {
      value: val,
      timeStamp: new Date().toISOString()
    }
    this.meter.send_trade_support(value)
  }

  sendFinance (val: string): void {
    const value = {
      value: val,
      timeStamp: new Date().toISOString()
    }
    this.meter.send_finance(value)
  }

  async _init_request (value: IMeterMqttBaseValue): Promise<void> {
    this.emit(IMeterReader.Event.Init, {
      approve: this.approve_contract.bind(this),
      meter: this.meter, value: value
    })
  }

  async _init_battery_power (value: IMeterMqttEasyBaseValue): Promise<void> {
    this.emit(IMeterReader.Event.BatteryPower, {
      approve: this._answer.bind(this),
      meter: this.meter, value: value
    })
  }

  async _init_emeter_power (value: IMeterMqttEasyBaseValue): Promise<void> {
    this.emit(IMeterReader.Event.EmeterPower, {
      approve: this._answer.bind(this),
      meter: this.meter, value: value
    })
  }

  async _init_amigo_price (value: IMeterMqttEasyBaseValue): Promise<void> {
    this.emit(IMeterReader.Event.AmigoPrice, {
      approve: this._answer.bind(this),
      meter: this.meter, value: value
    })
  }

  async _init_enode_port_power (value: IMeterMqttEasyBaseValue): Promise<void> {
    this.emit(IMeterReader.Event.PowerFromEnodeAndPort, {
      approve: this._answer.bind(this),
      meter: this.meter, value: value
    })
  }

  async _init_enode_load_power (value: IMeterMqttEasyBaseValue): Promise<void> {
    this.emit(IMeterReader.Event.ValueFromEnodeAndLoad, {
      approve: this._answer.bind(this),
      meter: this.meter, value: value
    })
  }

  async _status_enode_relay_power (value: IMeterMqttEasyBaseStatus): Promise<void> {
    this.emit(IMeterReader.Event.StatusFromEnodeRelay, {
      approve: this._answer.bind(this),
      meter: this.meter, value: value
    })
  }

  async _status_relay_power (value: IMeterMqttEasyBaseStatus): Promise<void> {
    this.emit(IMeterReader.Event.StatusFromRelay, {
      approve: this._answer.bind(this),
      meter: this.meter, value: value
    })
  }

  currentValue (): Promise<IMeterValue> {
    throw new Error('FIXME MeterMqttReader::currentValue does not make sense')
  }

  approve_contract (value: IMeterMqttBaseValue, status: boolean): void {
    this.meter.send_approve_init(value)
  }

  start (): void {
    this.meter.start()
  }

  stop (): void {
    this.meter.stop()
  }
}
