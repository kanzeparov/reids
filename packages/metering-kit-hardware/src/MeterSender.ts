import {
  IMeterValue,
  IMeterConfiguration,
  ResponseStatus,
  IHardwareDatabase
} from '@onder/interfaces'
import { MeterTransportClient } from '@onder/common'
import Logger from './Logger'

const log = new Logger('meter-sender')

class MeterSender {
  private maxElements = 10 // 30 seconds
  private readonly quantum: number
  private db: IHardwareDatabase
  private readonly configuration: IMeterConfiguration
  private client: MeterTransportClient

  constructor (quantum: number, configuration: IMeterConfiguration, meterTransport: MeterTransportClient, hardwareDatabase: IHardwareDatabase) {
    this.configuration = configuration
    this.client = meterTransport
    this.db = hardwareDatabase
    this.quantum = quantum
  }

  async sendValue (account: string, value: IMeterValue) {
    try {
      const array = [ value ]
      await this.db.addMeterValues(account, array)
      await this.sendOne(array)
    } catch (e) {
      log.error(e)
    }
  }

  private async sendOne (values: Array<IMeterValue>): Promise<void> {
    const status = await this.client.sendMeterValue(values)

    switch (status) {
      case ResponseStatus.ConfigurationNotSet:
        await this.client.sendMeterConfiguration(this.configuration)
          .catch((reason: any) => {
            log.error(`Can't send meter configuration ${reason}`)
          })
        break
      case ResponseStatus.Error:
        log.error('Server responded with error', status)
        throw new Error('Response status:' + ResponseStatus.Error)
      case ResponseStatus.Success:
        await this.db.clearAllMeterValues(this.configuration.account, values)
        break
    }
  }

}

export default MeterSender
