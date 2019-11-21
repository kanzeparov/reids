import { Component, OnInit } from '@angular/core';

import { animate, group, query, style, transition, trigger } from '@angular/animations';

import { GravatarService } from '@core/services/gravatar.service';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ChannelsDrawerService } from '@modules/dashboard/services/channels/channels-drawer.service';
import { ChannelsApiService } from '@modules/dashboard/services/channels/channels-api.service';

import {
  ApiChannelsBalance,
  ApiChannelsResponse,
  ApiCloseChannelResponse,
} from '@modules/dashboard/models/api-channel.model';

import { MetersStoreService } from '@modules/dashboard/services/meters/meters-store.service';
import { ChannelsBalanceService } from '@modules/dashboard/services/channels/channels-balance.service';
import { ChannelsDataService } from '@modules/dashboard/services/channels/channels-data.service';
import { ChannelActionType, ChannelsMeter, ChannelsTableItem } from '@modules/dashboard/models/channel.model';
import { map, finalize } from 'rxjs/operators';

/* Animation setup */

const styleCentered = style({ right: '0' });
const styleShifted = style({ right: '-300px' });
const styleTransparent = style({ opacity: 0 });
const styleVisible = style({ opacity: 1 });

@Component({
  selector: 'dashboard-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.scss'],
  providers: [
    ChannelsApiService,
    MetersStoreService,
    ChannelsBalanceService,
    ChannelsDataService,
  ],
  animations: [
    trigger('openCloseTrigger', [
      transition(':enter', [
        styleShifted,
        group([
          animate('0.2s', styleCentered),
          query('.channels__wrap', [
            styleTransparent,
            animate('0.2s', styleVisible),
          ]),
        ]),
      ]),

      transition(':leave', [
        group([
          animate('0.2s', styleShifted),
          query('.channels__wrap', [
            animate('0.2s', styleTransparent),
          ]),
        ]),
      ]),
    ]),
  ],
})
export class ChannelsComponent implements OnInit {
  intermediateState$: BehaviorSubject<any> = new BehaviorSubject({});

  channelsFetchState = {
    hasFetched: false,
    hasErrors: false,
  };

  isSender = false; // Sender -> Buyer
  allActionsBlocked = false;

  meter: ChannelsMeter;
  channelsTableItems$: BehaviorSubject<ChannelsTableItem[]> = new BehaviorSubject([]);
  hasSettledChannels$ = this.channelsTableItems$.pipe(map(this.filterSettledChannels));
  channelsApiRequest$: Subscription;

  ethOnchainBalance = 0;
  miptOnchainBalance = 0;
  miptOffchainBalance = 0;

  constructor(
    private gravatar: GravatarService,
    private drawer: ChannelsDrawerService,
    private api: ChannelsApiService,
    private metersStore: MetersStoreService,
    private balanceService: ChannelsBalanceService,
    private channelData: ChannelsDataService,
  ) {}

  ngOnInit() {
    this.drawer.init(this.intermediateState$);

    this.intermediateState$.subscribe(({ isOpen, meterUuid }) => {
      if (typeof isOpen === 'undefined') {
        return;
      }

      if (meterUuid) {
        this.channelData.buildChannelMeter(meterUuid).subscribe(
          (channelsMeter: ChannelsMeter) => this.meter = channelsMeter
        );
        this.fetchChannels(meterUuid);
      }

      if (!isOpen) {
        this.resetChannelData();
      }
    });
  }

  fetchChannels(meterUuid: string) {
    this.channelsFetchState.hasErrors = false;
    this.channelsFetchState.hasFetched = false;

    this.channelsApiRequest$ = this.api
      .getChannels(meterUuid)
      .subscribe((response: ApiChannelsResponse) => {
        this.channelsFetchState.hasFetched = true;

        const { balance, channels } = response;

        this.setBalances(balance);

        this.isSender = this.channelData.isSender(channels, meterUuid);
        this.channelData.buildTableItems(channels, meterUuid).subscribe(this.updateTableItems);
      }, () => {
          this.channelsFetchState.hasErrors = true;
      });
  }

  filterSettledChannels(channelTableItems: ChannelsTableItem[]) {
    const settledChannels = channelTableItems.filter((channelTableItem: ChannelsTableItem) => {
      return channelTableItem.channel.meta.isSettled;
    });

    return Boolean(settledChannels.length);
  }

  setBalances(balances: ApiChannelsBalance[]) {
    const ethBalance = this.balanceService.getEthBalance(balances);
    const miptBalance = this.balanceService.getMiptBalance(balances);

    this.ethOnchainBalance = ethBalance.onchain;
    this.miptOnchainBalance = miptBalance.onchain;
    this.miptOffchainBalance = miptBalance.offchain;
  }

  closeChannel(channelsTableItem: ChannelsTableItem) {
    if (this.allActionsBlocked) {
      return;
    }

    const meterUuid = this.meter.uuid;
    const channelUuid = channelsTableItem.channel.uuid;

    this.allActionsBlocked = true;
    this.rebuildTableItemsBeforeClose(channelsTableItem);

    this.api.closeChannel(meterUuid, channelUuid)
      .pipe(
        finalize(() => this.allActionsBlocked = false),
      )
      .subscribe((closeResponse: ApiCloseChannelResponse) => {
        this.rebuildTableItemsAfterClose(channelsTableItem, closeResponse);
      }, () => {
        this.rebuildTableItemsAfterCloseError(channelUuid);
      });
  }

  onCountdownFinished(channelUuid: string) {
    this.rebuildTableItemsAfterCountdown(channelUuid);
  }

  closeDrawer() {
    if (this.allActionsBlocked) {
      return;
    }

    this.drawer.close();
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

  private resetChannelData () {
    if (this.channelsApiRequest$) {
      this.channelsApiRequest$.unsubscribe();
    }

    this.updateTableItems([]);
    this.ethOnchainBalance = 0;
    this.miptOnchainBalance = 0;
    this.miptOffchainBalance = 0;
  }
}
