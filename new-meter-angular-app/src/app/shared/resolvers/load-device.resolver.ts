import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { first } from 'rxjs/operators';

import { DeviceSelectorsService } from '@modules/device/services/device-selectors.service';

@Injectable({
  providedIn: 'root'
})
export class LoadDeviceResolver implements Resolve<any> {
  constructor(
    private deviceSelectors: DeviceSelectorsService,
  ) {}

  resolve() {
    return this.deviceSelectors.whenLoaded$().pipe(first());
  }
}
