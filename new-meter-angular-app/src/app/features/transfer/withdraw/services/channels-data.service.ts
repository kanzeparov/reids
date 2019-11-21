import { Injectable } from '@angular/core';

import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

import {
  ChannelAction,
  ChannelsTableItem,
} from '../models/channel.model';

import { GravatarSelectorsService } from '@modules/gravatar/services/gravatar-selectors.service';
import { GravatarsCollection } from '@modules/gravatar/store/gravatar.model';

import { TOKEN_EXPONENT } from '@shared/shared.constant';
import { ChannelsMetaDataService } from './channels-meta-data.service';
import { ChannelItem } from '@modules/channels/store/channels.model';
import { DeviceData } from '@modules/device/store/device.model';

export type CombinedItemsArgs = [boolean, ChannelItem[], GravatarsCollection];

@Injectable()
export class ChannelsDataService {

  constructor(
    private gravatarSelectors: GravatarSelectorsService,
    private channelMeta: ChannelsMetaDataService,
  ) { }

  buildTableItems(channels$: Observable<ChannelItem[]>, deviceData$: Observable<DeviceData>) {
    const isSender$ = deviceData$.pipe(
      map(({ isSender }: DeviceData) => isSender)
    );
    const gravatars$ = this.gravatarSelectors.getGravatars$();

    return combineLatest(
      isSender$,
      channels$,
      gravatars$,
    ).pipe(
      map(this.combineItems),
    );
  }

  buildUpdatedTableItems(items$: BehaviorSubject<ChannelsTableItem[]>, channelAction: ChannelAction) {
    return items$.pipe(
      first(),
      map((items: ChannelsTableItem[]) => {
        const { channelUuid } = channelAction.payload;

        const prevItem = items.find((item: ChannelsTableItem) => item.channel.uuid === channelUuid);
        const prevItemIndex = items.indexOf(prevItem);
        const newItems = items.slice(0);

        newItems[prevItemIndex] = {
          ...prevItem,
          channel: {
            ...prevItem.channel,
            meta: this.channelMeta.buildUpdatedMeta(channelAction),
          },
        };

        return newItems;
      })
    );
  }

  private combineItems = ([isSender, channels, gravatars]: CombinedItemsArgs): ChannelsTableItem[] => {
    return channels.map((channel: ChannelItem) => {
      const meterUuid = channel.meterUuid;
      const bill = channel.bill;
      const gravatar = gravatars[meterUuid];

      return {
        gravatar,

        channel: {
          uuid: channel.uuid,
          meterUuid: channel.meterUuid,
          bill: this.normalizeTokens(bill),
          meta: this.channelMeta.buildInitialMeta(isSender, channel),
        },
      };
    });
  }

  normalizeTokens(rawTokens: number) {
    return (rawTokens * TOKEN_EXPONENT).toFixed(3);
  }
}
