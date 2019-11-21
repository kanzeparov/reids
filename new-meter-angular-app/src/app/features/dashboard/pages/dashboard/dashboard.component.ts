import { Component, OnInit, OnDestroy } from '@angular/core';

import { switchMap } from 'rxjs/operators';
import { untilDestroyed } from 'ngx-take-until-destroy';

import { DashboardChannelsService } from '@features/dashboard/services/dashboard-channels.service';
import { ChannelsSelectorsService } from '@modules/channels/services/channels-selectors.service';

import { AccountBalanceSelectorsService } from '@modules/account-balance/services/account-balance-selectors.service';

import { DeviceApiService } from '@modules/device/services/device-api.service';
import { DeviceSelectorsService } from '@modules/device/services/device-selectors.service';
import { DeviceActionsService } from '@modules/device/services/device-actions.service';
import { Web3Service } from '@modules/web3/services/web3.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [
    DashboardChannelsService,
  ],
})
export class DashboardComponent implements OnInit, OnDestroy {
  whenDeviceLoaded$ = this.deviceSelectors.whenLoaded$();

  channels$ = this.channelsSelectors.getOpenChannels$();
  channelsBillDiff$ = this.dashboardChannels.getChannelsBillDiff$();

  onchainBalanceList$ = this.whenDeviceLoaded$.pipe(
    switchMap(() => this.accountBalanceSelectors.getOnchainBalanceList$())
  );
  offchainBalanceList$ = this.whenDeviceLoaded$.pipe(
    switchMap(() => this.accountBalanceSelectors.getOffchainBalanceList$())
  );

  transferAvailable$ = this.web3Service.isAvailable$;

  constructor(
    private deviceApi: DeviceApiService,
    private deviceSelectors: DeviceSelectorsService,
    private deviceActions: DeviceActionsService,

    private accountBalanceSelectors: AccountBalanceSelectorsService,

    private channelsSelectors: ChannelsSelectorsService,
    private dashboardChannels: DashboardChannelsService,

    private web3Service: Web3Service,
  ) { }

  ngOnInit() {
    this.deviceApi.pollDeviceData$()
      .pipe(untilDestroyed(this))
      .subscribe(this.deviceActions.addToStore);
  }

  ngOnDestroy() { }
}
