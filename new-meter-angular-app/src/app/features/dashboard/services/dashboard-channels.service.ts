import { Injectable } from '@angular/core';
import { filter, map, pairwise } from 'rxjs/operators';

import { HexString } from '@shared/shared.types';

import { ChannelItem, ChannelsCollection } from '@modules/channels/store/channels.model';
import { ChannelsSelectorsService } from '@modules/channels/services/channels-selectors.service';

import { DashboardChannelsBillDiff } from '@features/dashboard/models/dashboard-channels.model';

@Injectable()
export class DashboardChannelsService {

  constructor(
    private channelsSelectors: ChannelsSelectorsService,
  ) { }

  getChannelsBillDiff$() {
    return this.channelsSelectors.getChannelsCollection$().pipe(
      pairwise(),
      filter(([prevChannels, _]: [ChannelsCollection, ChannelsCollection]) => {
        return Object.keys(prevChannels).length > 0;
      }),
      map(([prevChannels, newChannels]: [ChannelsCollection, ChannelsCollection]) => {
        return Object.entries(newChannels)
          .reduce((memo: DashboardChannelsBillDiff, [uuid, newChannel]: [HexString, ChannelItem]) => {
            const prevChannel = prevChannels[uuid];
            if (!prevChannel) {
              return { ...memo, [uuid]: 0 };
            }

            return { ...memo, [uuid]: newChannel.bill - prevChannel.bill };
          }, {});
      }),
    );
  }
}
