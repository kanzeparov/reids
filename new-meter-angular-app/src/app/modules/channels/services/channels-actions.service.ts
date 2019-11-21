import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { AppState } from '@app/app.state';
import { GravatarActionsService } from '@modules/gravatar/services/gravatar-actions.service';

import { toSafeNumber } from '@utils/number.util';

import { ApiChannelsItem } from '../api-channel.model';
import { ChannelItem, ChannelsCollection } from '../store/channels.model';
import * as ChannelsActions from '../store/channels.actions';

@Injectable()
export class ChannelsActionsService {

  constructor(
    private store$: Store<AppState>,
    private gravatarActions: GravatarActionsService,
  ) { }

  addCollection = (isSender: boolean, apiChannels: ApiChannelsItem[]) => {
    const collection: ChannelsCollection = apiChannels.reduce((memo, apiChannel: ApiChannelsItem) => {
      const channel = this.buildChannelItem(isSender, apiChannel);

      return { ...memo, [apiChannel.channelId]: channel };
    }, {});

    return this.store$.dispatch(new ChannelsActions.AddCollection(collection));
  }

  addGravatarsCollection(apiChannels: ApiChannelsItem[]) {
    const allUuids = apiChannels.reduce((memo: string[], apiChannel: ApiChannelsItem) => {
      return [ ...memo, apiChannel.sender, apiChannel.receiver ];
    }, []);
    const uniqueUuids = Array.from(new Set(allUuids));

    this.gravatarActions.addCollection(uniqueUuids);
  }

  updateChannel = (updatedApiChannel: ApiChannelsItem) => {
    const channel = this.buildChannelItem(true, updatedApiChannel);

    return this.store$.dispatch(new ChannelsActions.UpdateItem(channel));
  }

  deleteChannel = (channelUuid: string) => {
    return this.store$.dispatch(new ChannelsActions.DeleteItem(channelUuid));
  }

  private buildChannelItem(isSender: boolean, apiChannel: ApiChannelsItem): ChannelItem {
    return {
      uuid: apiChannel.channelId,
      meterUuid: isSender ? apiChannel.receiver : apiChannel.sender,
      value: toSafeNumber(apiChannel.value),
      spent: toSafeNumber(apiChannel.spent),
      bill: this.calcBill(isSender, apiChannel.value, apiChannel.spent),
      state: apiChannel.state,
      settlingUntil: apiChannel.settlingUntil,
    };
  }

  private calcBill(isSender: boolean, apiValue: string, apiSpent: string) {
    const value = toSafeNumber(apiValue);
    const spent = toSafeNumber(apiSpent);

    return isSender ? value - spent : spent;
  }
}
