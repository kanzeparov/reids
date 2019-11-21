import { Injectable } from '@angular/core';
import { ApiChannelsListItem } from '@modules/dashboard/models/api-channel.model';
import {
  ChannelAction, ChannelAfterCloseAction, ChannelMeta,
  ChannelStatus,
  ReceiverChannelStatus,
  SenderChannelStatus,
} from '@modules/dashboard/models/channel.model';

import { ChannelsStatusService } from '@modules/dashboard/services/channels/channels-status.service';

import { unixTimestampDiff } from '@utils/datetime.util';
import { deepMergeAll } from '@utils/deepmerge.util';

@Injectable()
export class ChannelsMetaDataService {
  ICONS = {
    CLOSE_CHANNEL: 'account_balance_wallet',
    CHANNEL_IS_SETTLING: 'lock',
    CHANNEL_IS_SETTLED: 'check',
  };

  BLANK_META = {
    status: null,
    message: null,
    messageCountdown: null,
    isSettled: false,
    isError: false,
    action: {
      icon: null,
      canPerform: false,
      isPerforming: false,
    },
  };

  constructor(private channelStatus: ChannelsStatusService) { }

  buildInitialMeta(isSender: boolean, channel: ApiChannelsListItem) {
    const status = this.channelStatus.getInitialStatus(isSender, channel);

    return this.buildMeta(status, { settlingUntil: channel.settlingUntil });
  }

  buildUpdatedMeta(channelAction: ChannelAction) {
    const { isSender } = channelAction.payload;
    const status = this.channelStatus.getStatusOnAction(isSender, channelAction);
    const settlingUntil = (channelAction as ChannelAfterCloseAction).payload.settlingUntil || 0;

    return this.buildMeta(status, { settlingUntil });
  }

  buildMeta(status: ChannelStatus, payload: { settlingUntil: number }) {
    switch (status) {
      case ReceiverChannelStatus.CanClose:            return this.getReceiverCanCloseMeta();
      case ReceiverChannelStatus.CanSettleOverPeriod: return this.getReceiverCanSettleOverPeriodMeta(payload.settlingUntil);
      case ReceiverChannelStatus.CanSettle:           return this.getReceiverCanSettleMeta();
      case ReceiverChannelStatus.IsClosing:           return this.getReceiverIsClosingMeta();
      case ReceiverChannelStatus.IsClosed:            return this.getReceiverIsClosedMeta();
      case ReceiverChannelStatus.CloseError:          return this.getReceiverCloseErrorMeta();

      case SenderChannelStatus.CanRequestClose:   return this.getSenderCanRequestCloseMeta();
      case SenderChannelStatus.IsRequestingClose: return this.getSenderIsRequestingCloseMeta();
      case SenderChannelStatus.RequestedClose:    return this.getSenderRequestedCloseMeta(payload.settlingUntil);
      case SenderChannelStatus.CanClose:          return this.getSenderCanCloseMeta();
      case SenderChannelStatus.IsClosing:         return this.getSenderIsClosingMeta();
      case SenderChannelStatus.IsClosed:          return this.getSenderIsClosedMeta();
      case SenderChannelStatus.CloseError:        return this.getSenderCloseErrorMeta();

      default: throw new Error(`Could not recognize channel status: ${status}`);
    }
  }

  /* Helper methods */

  private getMessageCountdown(settlingUntil: number) {
    const countdown = unixTimestampDiff(settlingUntil);
    return countdown > 0 ? countdown : 0;
  }

  private mergeWithBlankMeta(metaToMerge: object): ChannelMeta {
    return deepMergeAll([ this.BLANK_META, metaToMerge ]);
  }

  /* Receiver meta builder methods */

  private getReceiverCanCloseMeta() {
    return this.mergeWithBlankMeta({
      status: ReceiverChannelStatus.CanClose,
      action: {
        icon: this.ICONS.CLOSE_CHANNEL,
        canPerform: true,
      },
    });
  }

  private getReceiverCanSettleOverPeriodMeta(settlingUntil: number) {
    return this.mergeWithBlankMeta({
      status: ReceiverChannelStatus.CanSettleOverPeriod,
      message: 'Better close in',
      messageCountdown: this.getMessageCountdown(settlingUntil),
      action: {
        icon: this.ICONS.CLOSE_CHANNEL,
        canPerform: true,
      },
    });
  }

  private getReceiverCanSettleMeta() {
    return this.mergeWithBlankMeta({
      status: ReceiverChannelStatus.CanSettle,
      message: 'Settlement period is over',
      action: {
        icon: this.ICONS.CLOSE_CHANNEL,
        canPerform: true,
      },
    });
  }

  private getReceiverIsClosingMeta() {
    return this.mergeWithBlankMeta({
      status: ReceiverChannelStatus.IsClosing,
      message: 'Transferring tokens',
      action: {
        isPerforming: true,
      },
    });
  }

  private getReceiverIsClosedMeta() {
    return this.mergeWithBlankMeta({
      status: ReceiverChannelStatus.IsClosed,
      message: 'Transferred tokens',
      isSettled: true,
      action: {
        icon: this.ICONS.CHANNEL_IS_SETTLED,
      },
    });
  }

  private getReceiverCloseErrorMeta() {
    return this.mergeWithBlankMeta({
      status: ReceiverChannelStatus.CloseError,
      message: 'Something went wrong',
      isError: true,
      action: {
        icon: this.ICONS.CLOSE_CHANNEL,
        canPerform: true,
      },
    });
  }

  /* Sender meta builder methods */

  private getSenderCanRequestCloseMeta() {
    return this.mergeWithBlankMeta({
      status: SenderChannelStatus.CanRequestClose,
      action: {
        icon: this.ICONS.CLOSE_CHANNEL,
        canPerform: true,
      },
    });
  }

  private getSenderIsRequestingCloseMeta() {
    return this.mergeWithBlankMeta({
      status: SenderChannelStatus.IsRequestingClose,
      message: 'Waiting for response',
      action: {
        isPerforming: true,
      },
    });
  }

  private getSenderRequestedCloseMeta(settlingUntil: number) {
    return this.mergeWithBlankMeta({
      status: SenderChannelStatus.RequestedClose,
      message: 'Close manually in',
      messageCountdown: this.getMessageCountdown(settlingUntil),
      action: {
        icon: this.ICONS.CHANNEL_IS_SETTLING,
      },
    });
  }

  private getSenderCanCloseMeta() {
    return this.mergeWithBlankMeta({
      status: SenderChannelStatus.CanClose,
      message: 'Ready for instant closing',
      action: {
        icon: this.ICONS.CLOSE_CHANNEL,
        canPerform: true,
      },
    });
  }

  private getSenderIsClosingMeta() {
    return this.mergeWithBlankMeta({
      status: SenderChannelStatus.IsClosing,
      message: 'Moving tokens onchain',
      action: {
        isPerforming: true,
      },
    });
  }

  private getSenderIsClosedMeta() {
    return this.mergeWithBlankMeta({
      status: SenderChannelStatus.IsClosed,
      message: 'Tokens moved onchain',
      isSettled: true,
      action: {
        icon: this.ICONS.CHANNEL_IS_SETTLED,
      },
    });
  }

  private getSenderCloseErrorMeta() {
    return this.mergeWithBlankMeta({
      status: SenderChannelStatus.CloseError,
      message: 'Something went wrong',
      isError: true,
      action: {
        icon: this.ICONS.CLOSE_CHANNEL,
        canPerform: true,
      },
    });
  }
}
