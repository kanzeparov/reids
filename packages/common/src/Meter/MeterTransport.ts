import { IMeterConfiguration, IMeterValue } from '@onder/interfaces'

namespace MeterTransport {
  export const VALUE_END_POINT = '/meterValue'
  export const CONFIGURATION_END_POINT = '/meterConfiguration'

  export enum Event {
    METER_CONFIGURATION,
    METER_VALUE
  }

  export type Events = {
    [Event.METER_CONFIGURATION]: IMeterConfiguration
    [Event.METER_VALUE]: { configuration: IMeterConfiguration, values: Array<IMeterValue> }
  }
}

export default MeterTransport
