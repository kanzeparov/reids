import { Injectable } from '@angular/core';

import { ApiChannelState, ApiCloseChannelEvent } from '@modules/channels/api-channel.model';

import {
  ChannelAction,
  ChannelActionType,
  ChannelAfterCloseAction,
  ChannelBeforeCloseAction,
  ReceiverChannelStatus,
  SenderChannelStatus,
} from '../models/channel.model';


import { unixTimestampDiff } from '@utils/datetime.util';
import { ChannelItem } from '@modules/channels/store/channels.model';

@Injectable()
export class ChannelsStatusService {

  constructor() { }

  /* Initial status */

  getInitialStatus(isSender: boolean, channel: ChannelItem) {
    return isSender ?
      this.getInitialSenderStatus(channel) :
      this.getInitialReceiverStatus(channel);
  }

  private getInitialReceiverStatus(channel: ChannelItem): ReceiverChannelStatus {
    if (channel.state === ApiChannelState.Open) {
      return ReceiverChannelStatus.CanClose;
    }

    if (channel.state === ApiChannelState.Settling) {
      const countdown = unixTimestampDiff(channel.settlingUntil);
      const countdownIsStale = countdown <= 0;

      if (countdownIsStale) {
        return ReceiverChannelStatus.CanSettle;
      }

      return ReceiverChannelStatus.CanSettleOverPeriod;
    }

    throw new Error(`Could not handle channel status for state: ${channel.state}`);
  }

  private getInitialSenderStatus(channel: ChannelItem): SenderChannelStatus {
    if (channel.state === ApiChannelState.Open) {
      return SenderChannelStatus.CanRequestClose;
    }

    if (channel.state === ApiChannelState.Settling) {
      const countdown = unixTimestampDiff(channel.settlingUntil);
      const countdownIsStale = countdown <= 0;

      if (countdownIsStale) {
        return SenderChannelStatus.CanClose;
      }

      return SenderChannelStatus.RequestedClose;
    }

    throw new Error(`Could not handle channel status for state: ${channel.state}`);
  }

  /* Status on (before and after) close */

  getStatusOnAction(isSender: boolean, channelAction: ChannelAction) {
    switch (channelAction.type) {
      case ChannelActionType.BeforeClose:
        return this.getStatusBeforeClose(isSender, channelAction as ChannelBeforeCloseAction);

      case ChannelActionType.AfterClose:
        return this.getStatusAfterClose(isSender, channelAction as ChannelAfterCloseAction);

      case ChannelActionType.CloseError:
        return this.getStatusAfterCloseError(isSender);

      case ChannelActionType.CountdownFinished:
        return this.getStatusAfterCountdownFinished(isSender);

      default: throw new Error(`Could not recognize status change action: ${channelAction.type}`);
    }
  }

  /* After countdown finished */

  private getStatusAfterCountdownFinished(isSender: boolean) {
    return isSender ?
      SenderChannelStatus.CanClose :
      ReceiverChannelStatus.CanSettle;
  }

  /* Close error */

  private getStatusAfterCloseError(isSender: boolean) {
    return isSender ?
      SenderChannelStatus.CloseError :
      ReceiverChannelStatus.CloseError;
  }

  /* Before close */

  private getStatusBeforeClose(isSender: boolean, channelAction: ChannelBeforeCloseAction) {
    return isSender ?
      this.getSenderStatusBeforeClose(channelAction) :
      this.getReceiverStatusBeforeClose(channelAction);
  }

  private getSenderStatusBeforeClose(channelAction: ChannelBeforeCloseAction) {
    const prevStatus = channelAction.payload.prevStatus;

    if (prevStatus === SenderChannelStatus.CanRequestClose) {
      return SenderChannelStatus.IsRequestingClose;
    }

    const allowedStatuses = [
      SenderChannelStatus.CanClose,
      SenderChannelStatus.CloseError,
    ];
    if (allowedStatuses.includes(prevStatus as SenderChannelStatus)) {
      return SenderChannelStatus.IsClosing;
    }

    throw new Error('Could not find before close action status for Sender');
  }

  private getReceiverStatusBeforeClose(channelAction: ChannelBeforeCloseAction) {
    const prevStatus = channelAction.payload.prevStatus;
    const allowedStatuses = [
      ReceiverChannelStatus.CanClose,
      ReceiverChannelStatus.CanSettle,
      ReceiverChannelStatus.CanSettleOverPeriod,
      ReceiverChannelStatus.CloseError,
    ];

    if (allowedStatuses.includes(prevStatus as ReceiverChannelStatus)) {
      return ReceiverChannelStatus.IsClosing;
    }

    throw new Error('Could not find before close action status for Receiver');
  }

  /* After close */

  private getStatusAfterClose(isSender: boolean, channelAction: ChannelAfterCloseAction) {
    return isSender ?
      this.getSenderStatusAfterClose(channelAction) :
      this.getReceiverStatusAfterClose(channelAction);
  }

  private getSenderStatusAfterClose(channelAction: ChannelAfterCloseAction) {
    const closeChannelEvents = channelAction.payload.closeChannelEvents;

    const didStartedSettling = closeChannelEvents.includes(ApiCloseChannelEvent.DidStartSettling);
    if (didStartedSettling) {
      return SenderChannelStatus.RequestedClose;
    }

    const didSettle = closeChannelEvents.includes(ApiCloseChannelEvent.DidSettle);
    if (didSettle) {
      return SenderChannelStatus.IsClosed;
    }

    throw new Error('Could not find after close action status for Sender');
  }

  private getReceiverStatusAfterClose(channelAction: ChannelAfterCloseAction) {
    const closeChannelEvents = channelAction.payload.closeChannelEvents;

    const didSettle = closeChannelEvents.includes(ApiCloseChannelEvent.DidSettle);
    const didClaim = closeChannelEvents.includes(ApiCloseChannelEvent.DidClaim);

    if (didSettle || didClaim) {
      return ReceiverChannelStatus.IsClosed;
    }

    throw new Error('Could not find after close action status for Receiver');
  }
}
