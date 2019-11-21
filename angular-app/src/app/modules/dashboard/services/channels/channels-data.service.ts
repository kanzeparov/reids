import { Injectable } from '@angular/core';

import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { ApiChannelsListItem } from '@modules/dashboard/models/api-channel.model';
import {
  ChannelAction,
  ChannelsTableItem,
} from '@modules/dashboard/models/channel.model';

import { MetersStoreService } from '@modules/dashboard/services/meters/meters-store.service';
import { MeterItem, MetersCollection } from '@store/meters/meter.model';

import { GravatarStoreService } from '@core/services/gravatar-store.service';
import { GravatarsCollection } from '@store/gravatars/gravatars.model';

import { PROPER_TOKEN_EXPONENT } from '@modules/dashboard/dashboard.constant';
import { toSafeNumber } from '@utils/number.util';
import { SafeHtml } from '@angular/platform-browser';
import { ChannelsMetaDataService } from '@modules/dashboard/services/channels/channels-meta-data.service';
import { ChannelsStatusService } from '@modules/dashboard/services/channels/channels-status.service';

export type CombinedMeterArgs = [MeterItem, SafeHtml];
export type CombinedItemsArgs = [boolean, ApiChannelsListItem[], MetersCollection, GravatarsCollection];

@Injectable()
export class ChannelsDataService {

  constructor(
    private metersStore: MetersStoreService,
    private gravatarStore: GravatarStoreService,
    private channelMeta: ChannelsMetaDataService,
    private channelStatus: ChannelsStatusService,
  ) { }

  isSender(channels: ApiChannelsListItem[], meterUuid: string) {
    return channels[0] && channels[0].sender === meterUuid;
  }

  buildChannelMeter(meterUuid: string) {
    const meter$ = this.metersStore.getMeterByUuid(meterUuid);
    const gravatar$ = this.gravatarStore.getGravatarByUuid(meterUuid);

    return combineLatest(
      meter$,
      gravatar$,
    ).pipe(
      first(),
      map(([meter, gravatar]: CombinedMeterArgs) => ({
        uuid: meter.uuid,
        name: meter.name,
        gravatar,
      })),
    );
  }

  buildTableItems(apiChannels: ApiChannelsListItem[], meterUuid: string) {
    const isSender$ = of(this.isSender(apiChannels, meterUuid));
    const meters$ = this.metersStore.getMeters();
    const channels$ = of(apiChannels);
    const gravatars$ = this.gravatarStore.getGravatars();

    return combineLatest(
      isSender$,
      channels$,
      meters$,
      gravatars$,
    ).pipe(
      first(),
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

  private combineItems = ([isSender, channels, meters, gravatars]: CombinedItemsArgs): ChannelsTableItem[] => {
    return channels.map((channel: ApiChannelsListItem) => {
      const meterUuid = isSender ? channel.receiver : channel.sender;
      const bill = this.calculateBill(isSender, channel);
      const meter = meters[meterUuid];
      const gravatar = gravatars[meterUuid];

      return {
        gravatar,

        meter: {
          uuid: meter.uuid,
          name: meter.name,
        },

        channel: {
          uuid: channel.channelId,
          bill: this.normalizeTokens(bill),
          meta: this.channelMeta.buildInitialMeta(isSender, channel),
        },
      };
    });
  }

  calculateBill(isSender: boolean, channel: ApiChannelsListItem) {
    const value = toSafeNumber(channel.value);
    const spent = toSafeNumber(channel.spent);

    return isSender ? value - spent : spent;
  }

  normalizeTokens(rawTokens: number) {
    return (rawTokens * PROPER_TOKEN_EXPONENT).toFixed(3);
  }
}
