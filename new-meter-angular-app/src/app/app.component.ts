import { Component } from '@angular/core';
import { DeviceSelectorsService } from '@modules/device/services/device-selectors.service';
import { DeviceActionsService } from '@modules/device/services/device-actions.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  deviceLoading$ = this.deviceSelectors.isLoading$();
  deviceLoadFailed$ = this.deviceSelectors.isLoadFailed$();

  constructor(
    private deviceSelectors: DeviceSelectorsService,
    private deviceActions: DeviceActionsService,
  ) { }

  reloadDevice() {
    this.deviceActions.loadDevice();
  }
}
