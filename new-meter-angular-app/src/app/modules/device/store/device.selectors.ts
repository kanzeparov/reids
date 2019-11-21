import { createSelector, createFeatureSelector } from '@ngrx/store';

import { AppState } from '@app/app.state';
import { DeviceState } from './device.state';

export const selectDevice = createFeatureSelector<AppState, DeviceState>(
  'device'
);

export const selectDeviceData = createSelector(
  selectDevice,
  (deviceState: DeviceState) => deviceState.data
);

export const selectDeviceMeta = createSelector(
  selectDevice,
  (deviceState: DeviceState) => deviceState.meta
);
