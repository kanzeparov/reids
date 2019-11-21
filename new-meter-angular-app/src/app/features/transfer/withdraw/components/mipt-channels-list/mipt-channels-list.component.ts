import { Component, OnDestroy, OnInit } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';
import { untilDestroyed } from 'ngx-take-until-destroy';

import { ApiCloseChannelResponse } from '@modules/channels/api-channel.model';

import { ChannelsDataService } from '@features/transfer/withdraw/services/channels-data.service';
import { ChannelActionType, ChannelsTableItem } from '@features/transfer/withdraw/models/channel.model';

import { ChannelsApiService } from '@modules/channels/services/channels-api.service';
import { ChannelsSelectorsService } from '@modules/channels/services/channels-selectors.service';
import { ChannelsActionsService } from '@modules/channels/services/channels-actions.service';

import { DeviceSelectorsService } from '@modules/device/services/device-selectors.service';
import { DeviceData } from '@modules/device/store/device.model';

@Component({
  selector: 'withdraw-mipt-channels-list',
  templateUrl: './mipt-channels-list.component.html',
  styleUrls: ['./mipt-channels-list.component.scss'],
  providers: [
    ChannelsDataService,
  ],
})
export class MiptChannelsListComponent implements OnInit, OnDestroy {
  channels$ = this.channelsSelectors.getAllChannels$();

  whenDeviceLoaded$ = this.deviceSelectors.whenLoaded$();
  deviceData$ = this.deviceSelectors.getDeviceData$();

  isSender: boolean; // Sender -> Buyer

  channelsTableItems$: BehaviorSubject<ChannelsTableItem[]> = new BehaviorSubject([]);

  constructor(
    private deviceSelectors: DeviceSelectorsService,

    private channelData: ChannelsDataService,
    private channelsApi: ChannelsApiService,
    private channelsSelectors: ChannelsSelectorsService,
    private channelsActions: ChannelsActionsService,
  ) {}

  ngOnInit() {
    this.whenDeviceLoaded$
      .pipe(
        switchMap(() => this.deviceData$),
        first(),
        untilDestroyed(this),
      )
      .subscribe((deviceData: DeviceData) => {
        this.isSender = deviceData.isSender;
      });

    const $t = this.whenDeviceLoaded$
      .pipe(
        switchMap(() => this.channelData.buildTableItems(this.channels$, this.deviceData$)),
        first(),
        untilDestroyed(this),
      )
      .subscribe(this.updateTableItems);
  }

  ngOnDestroy() { }

  closeChannel(channelsTableItem: ChannelsTableItem) {
    const channelUuid = channelsTableItem.channel.uuid;

    this.rebuildTableItemsBeforeClose(channelsTableItem);

    this.channelsApi.closeChannel(channelUuid)
      .pipe(
        untilDestroyed(this),
      )
      .subscribe((closeResponse: ApiCloseChannelResponse) => {
        if (closeResponse.channel) {
          this.channelsActions.updateChannel(closeResponse.channel);
        } else {
          this.channelsActions.deleteChannel(channelUuid);
        }

        this.rebuildTableItemsAfterClose(channelsTableItem, closeResponse);
      }, () => {
        this.rebuildTableItemsAfterCloseError(channelUuid);
      });
  }

  onCountdownFinished(channelUuid: string) {
    this.rebuildTableItemsAfterCountdown(channelUuid);
  }

  private rebuildTableItemsBeforeClose(channelsTableItem: ChannelsTableItem) {
    const channelUuid = channelsTableItem.channel.uuid;
    const prevStatus = channelsTableItem.channel.meta.status;

    const beforeCloseAction = {
      type: ChannelActionType.BeforeClose,
      payload: {
        isSender: this.isSender,
        channelUuid,
        prevStatus,
      }
    };

    this.channelData.buildUpdatedTableItems(
      this.channelsTableItems$,
      beforeCloseAction,
    ).subscribe(this.updateTableItems);
  }

  private rebuildTableItemsAfterCountdown(channelUuid: string) {
    const countdownFinishedAction = {
      type: ChannelActionType.CountdownFinished,
      payload: {
        isSender: this.isSender,
        channelUuid,
      }
    };

    this.channelData.buildUpdatedTableItems(
      this.channelsTableItems$,
      countdownFinishedAction,
    ).subscribe(this.updateTableItems);
  }

  private rebuildTableItemsAfterCloseError(channelUuid: string) {
    const closeErrorAction = {
      type: ChannelActionType.CloseError,
      payload: {
        isSender: this.isSender,
        channelUuid,
      }
    };

    this.channelData.buildUpdatedTableItems(
      this.channelsTableItems$,
      closeErrorAction,
    ).subscribe(this.updateTableItems);
  }

  private rebuildTableItemsAfterClose(channelsTableItem: ChannelsTableItem, apiResponse: ApiCloseChannelResponse) {
    const channelUuid = channelsTableItem.channel.uuid;
    const closeChannelEvents = apiResponse.events.map(({ event }) => event);
    const settlingUntil = apiResponse.channel ? apiResponse.channel.settlingUntil : null;

    const afterCloseAction = {
      type: ChannelActionType.AfterClose,
      payload: {
        isSender: this.isSender,
        channelUuid,
        closeChannelEvents,
        settlingUntil,
      }
    };

    this.channelData.buildUpdatedTableItems(
      this.channelsTableItems$,
      afterCloseAction,
    ).subscribe(this.updateTableItems);
  }

  private updateTableItems = (items: ChannelsTableItem[]) => {
    this.channelsTableItems$.next(items);
  }
}
