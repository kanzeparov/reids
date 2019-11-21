import MeterMQTT from '../Meter/MeterMqtt'
import MeterMqttReader from '../Meter/MeterMqttReader'
import { ConnectionKind,
         IMeterConfigurationMQTT,
         ILightMeterConfiguration,
         IMeterMqttBaseValue,
         LightConfigurationSerde
} from '@onder/interfaces'
import { BigNumber } from 'bignumber.js';
import Logger from '../Logger'
import IMeterReader from '../Meter/IMeterReader'

const log = new Logger('mqtt-client')

const meterConfiguration: IMeterConfigurationMQTT = {
    kind: ConnectionKind.MQTT,
    account: "0",
    host: 'mosquitto.onder.tech',
    port: 80,
    username: 'jellyfish',
    password: '1q2w3e4r',
    ideaId: "Agent1"
}

const mqtt_reader = new MeterMqttReader(new MeterMQTT(meterConfiguration))
mqtt_reader.start()

mqtt_reader.on(IMeterReader.Event.Init, payload => {
      payload.value.approved = true
      log.debug("Contract init %o", payload.value)
      payload.approve(payload.value)
})

mqtt_reader.on(IMeterReader.Event.Progress, payload => {
     log.debug("Contract progress %o", payload.value)
     payload.value.payment_state = true
     payload.approve(payload.value)
})

mqtt_reader.on(IMeterReader.Event.NewAgent, payload => {
     log.debug("New agent %o", payload.value)
     if (payload.value.agentId != meterConfiguration.ideaId) {
          payload.answer("0x3480948")
     }
})