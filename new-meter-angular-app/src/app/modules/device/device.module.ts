import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { deviceReducer } from './store/device.reducer';

import { DeviceActionsService } from './services/device-actions.service';
import { DeviceSelectorsService } from './services/device-selectors.service';
import { DeviceApiService } from './services/device-api.service';

@NgModule({
  imports: [
    StoreModule.forFeature('device', deviceReducer),
  ],
  providers: [
    DeviceApiService,
    DeviceActionsService,
    DeviceSelectorsService,
  ],
})
export class DeviceModule { }
