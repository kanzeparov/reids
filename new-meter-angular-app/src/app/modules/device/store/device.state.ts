import { BaseMeta } from '@core/store/base.model';
import { DeviceData } from './device.model';

export interface DeviceState {
  data: DeviceData;
  meta: BaseMeta;
}
