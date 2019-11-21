import {
  RoomPeriod
} from '@onder/interfaces'
import { Moment } from 'moment'

export default interface IMeasurmentsRequest {
  period: RoomPeriod
  from?: Moment
}
