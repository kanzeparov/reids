import {
  IMeter,
  IMeterConfigurationMQTT,
  IMeterMqttAgentsValue,
  IMeterMqttBaseValue,
  IMeterMqttEasyBaseStatus,
  IMeterMqttEasyBaseString,
  IMeterMqttEasyBaseValue,
  IMeterMqttPassportValue,
  IMeterMqttProgressValue,
  IMeterValue
} from '@onder/interfaces'
import Logger from '../Logger'
import { TypedEventEmitter } from '@elderapo/typed-event-emitter'
import mqtt from 'mqtt'
import { config } from 'bluebird'

const log = new Logger('mqtt-client')

function makeid (length: number): string {
  let result = ''
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

class MeterMQTT extends TypedEventEmitter<MeterMQTT.Events> implements IMeter {
  Client?: mqtt.MqttClient
  private options: any
  private started: number
  private ideaId: number
  readonly configuration: IMeterConfigurationMQTT
  constructor (configuration: IMeterConfigurationMQTT) {
    super()
    this.options = {
      port: configuration.port,
      host: configuration.host,
      clientId: makeid(20),
      username: configuration.username,
      password: configuration.password,
      keepalive: 60,
      reconnectPeriod: 1000,
      rejectUnauthorized: true,
      protocol: 'mqtt'
    }
    this.started = 0
    this.ideaId = parseInt(configuration.ideaId!.match(/\d+/)![0], 10)
    this.configuration = configuration
  }

  // For backward compatibility
  currentValue (): Promise<IMeterValue> {
    return new Promise((resolve, reject) => { })
  }

  /*
   * Main processing hub, here all topics should be parsed and
   * dedicated handler dispatched
   */
  topic_handler (topic: string, message: string): void {
    log.info('Received a new message from %o', topic.toString())

    // READ

    // Process contract init
    if (/^(\/testbed\/enode[0-9]+\/contracts\/[0-9]+\/init)/.test(topic)) {
      let json_msg: IMeterMqttBaseValue = JSON.parse(message)
      json_msg.timeStamp = String(new Date(json_msg.timeStamp).getTime() / 1000)
      this.emit(MeterMQTT.Event.INIT_RCVD, json_msg)
    }
    // Process progress
    if (/^(\/testbed\/enode[0-9]+\/contracts\/[0-9]+\/progress)/.test(topic)) {
      let json_msg: IMeterMqttProgressValue = JSON.parse(message)
      json_msg.timeStamp = String(new Date(json_msg.timeStamp).getTime() / 1000)
      this.emit(MeterMQTT.Event.PROGRESS_RCVD, json_msg)
    }
    // Process new node
    if (/^(\/testbed\/enode[0-9]+\/known_agents)/.test(topic)) {
      let json_msg: IMeterMqttAgentsValue = JSON.parse(message)
      json_msg.timeStamp = String(new Date(json_msg.timeStamp).getTime() / 1000)
      this.emit(MeterMQTT.Event.AGENT_RCVD, json_msg)
    }
    // power from internal - topic 16
    if (/^(\/testbed\/enode[0-9]+\/ext_battery\/power)/.test(topic)) {
      let json_msg: IMeterMqttEasyBaseValue = JSON.parse(message)
      json_msg.timeStamp = String(new Date(json_msg.timeStamp).getTime() / 1000)
      this.emit(MeterMQTT.Event.BATTERY_POWER_RCVD, json_msg)
    }
    // power from emeterX - topic 40
    if (/^(\/testbed\/emeter[0-9]+\/power)/.test(topic)) {
      let json_msg: IMeterMqttEasyBaseValue = JSON.parse(message)
      json_msg.timeStamp = String(new Date(json_msg.timeStamp).getTime() / 1000)
      this.emit(MeterMQTT.Event.EMETER_POWER_RCVD, json_msg)
    }
    // price from amigo - topic 107
    if (/^(\/testbed\/amigo\/set_price)/.test(topic)) {
      let json_msg: IMeterMqttEasyBaseValue = JSON.parse(message)
      json_msg.timeStamp = String(new Date(json_msg.timeStamp).getTime() / 1000)
      this.emit(MeterMQTT.Event.PRICE_AMIGO_RCVD, json_msg)
    }
    // power from enodeX and portX - topic 6
    if (/^(\/testbed\/enode[0-9]+\/port[0-9]+\/power)/.test(topic)) {
      let json_msg: IMeterMqttEasyBaseValue = JSON.parse(message)
      json_msg.timeStamp = String(new Date(json_msg.timeStamp).getTime() / 1000)
      json_msg.senderId = topic.split('/')[3].slice(-1)
      this.emit(MeterMQTT.Event.POWER_ENODE_PORT_RCVD, json_msg)
    }
    // value from enodeX and loadX - topic 32/33/34/35
    if (/^(\/testbed\/enode[0-9]+\/load[0-9]+\/value)/.test(topic)) {
      let json_msg: IMeterMqttEasyBaseValue = JSON.parse(message)
      json_msg.timeStamp = String(new Date(json_msg.timeStamp).getTime() / 1000)
      json_msg.senderId = topic.split('/')[3].slice(-1)
      this.emit(MeterMQTT.Event.POWER_ENODE_LOAD_RCVD, json_msg)
    }
    // status from enodeX and relayX - topic 101
    if (/^(\/testbed\/enode[0-9]+\/load\/relay[0-9]+\/status)/.test(topic)) {
      let json_msg: IMeterMqttEasyBaseStatus = JSON.parse(message)
      json_msg.timeStamp = String(new Date(json_msg.timeStamp).getTime() / 1000)
      json_msg.senderId = topic.split('/')[4].slice(-1)
      this.emit(MeterMQTT.Event.STATUS_ENODE_RELAY_RCVD, json_msg)
    }
    // status from relay - topic 105
    if (/^(\/testbed\/relay\/router\/mode)/.test(topic)) {
      let json_msg: IMeterMqttEasyBaseStatus = JSON.parse(message)
      json_msg.timeStamp = String(new Date(json_msg.timeStamp).getTime() / 1000)
      json_msg.senderId = topic.split('/')[2]
      this.emit(MeterMQTT.Event.STATUS_ROUTER_RCVD, json_msg)
    }

    // //SEND
    // //type gen from UI - topic 60
    // if (/^(\/testbed\/enode[0-9]+\/gen[0-9]+\/type)/.test(topic)) {
    //   let json_msg: IMeterMqttEasyBaseString = JSON.parse(message)
    //   json_msg.timeStamp = String(new Date(json_msg.timeStamp).getTime())
    //   this.emit(MeterMQTT.Event.BATTERY_POWER_RCVD, json_msg)
    // }
    // //parametr gen from UI - topic 115
    // if (/^(\/testbed\/enode[0-9]+\/gen[0-9]+\/parameter)/.test(topic)) {
    //   let json_msg: IMeterMqttEasyBaseValue = JSON.parse(message)
    //   json_msg.timeStamp = String(new Date(json_msg.timeStamp).getTime())
    //   this.emit(MeterMQTT.Event.BATTERY_POWER_RCVD, json_msg)
    // }
    // //amigo status from UI - topic 111
    // if (/^(\/testbed\/amigo\/unload_support)/.test(topic)) {
    //   let json_msg: IMeterMqttEasyBaseStatus = JSON.parse(message)
    //   json_msg.timeStamp = String(new Date(json_msg.timeStamp).getTime())
    //   this.emit(MeterMQTT.Event.BATTERY_POWER_RCVD, json_msg)
    // }
    // //load value from UI - topic 63
    // if (/^(\/testbed\/enode[0-9]+\/load[0-9]+\/priotity)/.test(topic)) {
    //   let json_msg: IMeterMqttEasyBaseString = JSON.parse(message)
    //   json_msg.timeStamp = String(new Date(json_msg.timeStamp).getTime())
    //   this.emit(MeterMQTT.Event.BATTERY_POWER_RCVD, json_msg)
    // }
    // //load type name from UI - topic 62
    // if (/^(\/testbed\/enode[0-9]+\/load[0-9]+\/type)/.test(topic)) {
    //   let json_msg: IMeterMqttEasyBaseString = JSON.parse(message)
    //   json_msg.timeStamp = String(new Date(json_msg.timeStamp).getTime())
    //   this.emit(MeterMQTT.Event.BATTERY_POWER_RCVD, json_msg)
    // }
    // //strategy type from UI - topic 65
    // if (/^(\/testbed\/enode[0-9]+\/mas_strat\/mode)/.test(topic)) {
    //   let json_msg: IMeterMqttEasyBaseString = JSON.parse(message)
    //   json_msg.timeStamp = String(new Date(json_msg.timeStamp).getTime())
    //   this.emit(MeterMQTT.Event.BATTERY_POWER_RCVD, json_msg)
    // }
    // //trade status from UI - topic 117
    // if (/^(\/testbed\/enode[0-9]+\/trade_support)/.test(topic)) {
    //   let json_msg: IMeterMqttEasyBaseStatus = JSON.parse(message)
    //   json_msg.timeStamp = String(new Date(json_msg.timeStamp).getTime())
    //   this.emit(MeterMQTT.Event.BATTERY_POWER_RCVD, json_msg)
    // }
  }

  connected (): void {
    this.started = 1
    log.info('Connected to the broker!')
    // For contract operation
    // READ
    const cellNumber: number = this.ideaId

    this.Client!.subscribe('/testbed/enode' + cellNumber + '/contracts/#')
    this.Client!.subscribe('/testbed/enode' + cellNumber + '/ext_battery/power')
    this.Client!.subscribe('/testbed/emeter' + cellNumber + '/power')
    this.Client!.subscribe('/testbed/amigo/set_price')
    this.Client!.subscribe('/testbed/enode' + cellNumber + '/+/power')
    this.Client!.subscribe('/testbed/enode' + cellNumber + '/+/value')
    this.Client!.subscribe('/testbed/enode' + cellNumber + '/+/+/status')
    this.Client!.subscribe('/testbed/relay/router/mode')

    // SEND
    // this.Client!.subscribe("/testbed/enode" + String(this.ideaId) + "/gen1/type")
    // this.Client!.subscribe("/testbed/enode" + String(this.ideaId) + "/gen2/type")
    // this.Client!.subscribe("/testbed/enode" + String(this.ideaId) + "/gen3/type")
    // this.Client!.subscribe("/testbed/enode" + String(this.ideaId) + "/gen1/parameter")
    // this.Client!.subscribe("/testbed/enode" + String(this.ideaId) + "/gen2/parameter")
    // this.Client!.subscribe("/testbed/enode" + String(this.ideaId) + "/gen3/parameter")
    // this.Client!.subscribe("/testbed/amigo/unload_support")
    // this.Client!.subscribe("/testbed/enode" + String(this.ideaId) + "/load1/priotity")
    // this.Client!.subscribe("/testbed/enode" + String(this.ideaId) + "/load2/priotity")
    // this.Client!.subscribe("/testbed/enode" + String(this.ideaId) + "/load3/priotity")
    // this.Client!.subscribe("/testbed/enode" + String(this.ideaId) + "/load1/type")
    // this.Client!.subscribe("/testbed/enode" + String(this.ideaId) + "/load2/type")
    // this.Client!.subscribe("/testbed/enode" + String(this.ideaId) + "/load3/type")
    // this.Client!.subscribe("/testbed/enode" + String(this.ideaId) + "/mas_strat/mode")
    // this.Client!.subscribe("/testbed/enode" + String(this.ideaId) + "/trade_support")
    // For new nodes

    this.Client!.subscribe('/testbed/+/known_agents')
    this.Client!.on('message', this.topic_handler.bind(this))
    this.emit(MeterMQTT.Event.STATUS_CONNECTED, true)
  }

  contract_preamble (id: number): string {
    return '/testbed/enode' + String(id) + '/contracts/'
  }

  agent_preamble (id: number): string {
    return '/testbed/enode' + String(id) + '/'
  }

  sendKnownAgent (value: string) {
    log.info('Sending answer to peers')

    let passport: IMeterMqttPassportValue = {
      ethereum_wallet: value
    }
    let answer: IMeterMqttAgentsValue = {
      timeStamp: new Date().toISOString(),
      agentId: 'Agent' + this.ideaId,
      passport: passport,
      known_agents: []
    }
    let topic = this.agent_preamble(this.ideaId) + 'known_agents'
    log.debug(topic)
    log.debug(JSON.stringify(answer))
    this.Client!.publish(topic, JSON.stringify(answer))
  }

  send_approve_init (value: IMeterMqttBaseValue): void {
    log.info('Sending approval to contract init')

    value.timeStamp = new Date().toISOString()
    const buyer = parseInt(value.contragent.match(/\d+/)![0], 10)
    const topic1 = this.contract_preamble(this.ideaId) + value.id + '/approval'
    const topic2 = this.contract_preamble(buyer) + value.id + '/approval'
    const answer: IMeterMqttBaseValue = value
    this.Client!.publish(topic1, JSON.stringify(answer))
    this.Client!.publish(topic2, JSON.stringify(answer))
  }

  send_approve_progress (value: IMeterMqttProgressValue): void {
    log.info('Sending approval to progress')

    value.timeStamp = new Date().toISOString()
    const buyer = parseInt(value.contragent.match(/\d+/)![0], 10)
    const topic1 = this.contract_preamble(this.ideaId) + 'progress'
    const topic2 = this.contract_preamble(buyer) + 'progress'
    const answer: IMeterMqttProgressValue = value
    this.Client!.publish(topic1, JSON.stringify(answer))
    this.Client!.publish(topic2, JSON.stringify(answer))
  }

  send_finance (value: IMeterMqttEasyBaseString): void {
    log.info('Sending finance')
    value.timeStamp = new Date().toISOString()

    const topic = this.agent_preamble(this.ideaId) + 'finance'

    this.Client!.publish(topic, JSON.stringify(value))
  }

  send_gen_type (value: IMeterMqttEasyBaseString): void {
    log.info('Sending gen')
    value.timeStamp = new Date().toISOString()
    const topic = this.agent_preamble(this.ideaId) + 'gen/type'
    this.Client!.publish(topic, JSON.stringify(value))
  }

  send_gen_parametr (value: IMeterMqttEasyBaseValue, gen: number): void {
    log.info('Sending gen')
    value.timeStamp = new Date().toISOString()
    const topic = this.agent_preamble(this.ideaId) + 'gen' + String(gen) + '/parameter'
    this.Client!.publish(topic, JSON.stringify(value))
  }

  send_amigo_unload_status (value: IMeterMqttEasyBaseStatus): void {
    log.info('Sending amigo unload')
    value.timeStamp = new Date().toISOString()
    const topic = '/testbed/amigo/unload_support'
    this.Client!.publish(topic, JSON.stringify(value))
  }

  send_load_priority (value: IMeterMqttEasyBaseString): void {
    log.info('Sending load priority')
    value.timeStamp = new Date().toISOString()
    const topic = this.agent_preamble(this.ideaId) + 'load/priority'
    this.Client!.publish(topic, JSON.stringify(value))
  }

  send_mas_strat_mode (value: IMeterMqttEasyBaseString): void {
    log.info('Sending trade support')
    value.timeStamp = new Date().toISOString()
    const topic = this.agent_preamble(this.ideaId) + 'mas_strat/mode'
    this.Client!.publish(topic, JSON.stringify(value))
  }

  send_trade_support (value: IMeterMqttEasyBaseStatus): void {
    log.info('Sending mas_strat mode')
    value.timeStamp = new Date().toISOString()
    const topic = this.agent_preamble(this.ideaId) + 'trade_support'
    this.Client!.publish(topic, JSON.stringify(value))
  }

  start (): void {
    log.info('Starting MQTT client')
    this.Client = mqtt.connect(this.options)
    this.Client.on('connect', this.connected.bind(this))
  }

  stop (): void {
    this.Client!.end()
  }
}

namespace MeterMQTT {
  export enum Event {
    INIT_RCVD,
    PROGRESS_RCVD,
    AGENT_RCVD,
    BATTERY_POWER_RCVD,
    EMETER_POWER_RCVD,
    PRICE_AMIGO_RCVD,
    POWER_ENODE_PORT_RCVD,
    POWER_ENODE_LOAD_RCVD,
    STATUS_ENODE_RELAY_RCVD,
    STATUS_ROUTER_RCVD,
    STATUS_CONNECTED
  }

  export type Events = {
    [Event.INIT_RCVD]: IMeterMqttBaseValue,
    [Event.PROGRESS_RCVD]: IMeterMqttProgressValue,
    [Event.AGENT_RCVD]: IMeterMqttAgentsValue,
    [Event.BATTERY_POWER_RCVD]: IMeterMqttEasyBaseValue,
    [Event.EMETER_POWER_RCVD]: IMeterMqttEasyBaseValue,
    [Event.PRICE_AMIGO_RCVD]: IMeterMqttEasyBaseValue,
    [Event.POWER_ENODE_PORT_RCVD]: IMeterMqttEasyBaseValue,
    [Event.POWER_ENODE_LOAD_RCVD]: IMeterMqttEasyBaseValue,
    [Event.STATUS_ENODE_RELAY_RCVD]: IMeterMqttEasyBaseStatus,
    [Event.STATUS_ROUTER_RCVD]: IMeterMqttEasyBaseStatus,
    [Event.STATUS_CONNECTED]: boolean
  }
}

export default MeterMQTT
