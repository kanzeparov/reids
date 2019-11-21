import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { AppState } from '@app/app.state';

import { AccountBalanceActionsService } from '@modules/account-balance/services/account-balance-actions.service';
import { ChannelsActionsService } from '@modules/channels/services/channels-actions.service';

import * as DeviceActions from '../store/device.actions';
import { DeviceAccountRole } from '../store/device.model';
import { ApiDeviceResponse } from '../api-device.model';
import { DeviceSelectorsService } from './device-selectors.service';

@Injectable()
export class DeviceActionsService {

  constructor(
    private store$: Store<AppState>,

    private deviceSelectors: DeviceSelectorsService,
    private channelsActions: ChannelsActionsService,
    private accountBalanceActions: AccountBalanceActionsService,
  ) { }

  loadDevice() {
    return this.store$.dispatch(new DeviceActions.LoadDevice());
  }

  loadSucceed = () => {
    return this.store$.dispatch(new DeviceActions.LoadSucceed());
  }

  loadFailed = (loadErrors: string[]) => {
    return this.store$.dispatch(new DeviceActions.LoadFailed(loadErrors));
  }

  addToStore = (apiDeviceResponse: ApiDeviceResponse) => {
    const { account, balance, channels } = apiDeviceResponse;
    const isSender = channels[0] && channels[0].sender === account;

    this.accountBalanceActions.addBalance(balance);
    this.channelsActions.addCollection(isSender, channels);
    this.channelsActions.addGravatarsCollection(channels);

    this.deviceSelectors.untilLoaded$().subscribe(() => {
      this.addData(isSender, account);
    });
  }

  addData = (isSender: boolean, accountAddress: string) => {
    const data = {
      accountAddress,
      accountRole: isSender ? DeviceAccountRole.Sender : DeviceAccountRole.Receiver,
      isSender,
    };

    return this.store$.dispatch(new DeviceActions.AddData(data));
  }
}
