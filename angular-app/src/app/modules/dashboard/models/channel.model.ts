import { SafeHtml } from '@angular/platform-browser';
import { ApiCloseChannelEvent } from '@modules/dashboard/models/api-channel.model';

export enum ChannelActionType {
  BeforeClose = '[ChannelAction] Sent close channel request',
  AfterClose = '[ChannelAction] Got close channel response',
  CloseError = '[ChannelAction] Could not close channel',
  CountdownFinished = '[ChannelAction] Countdown finished',
}

export interface ChannelSimpleAction {
  type: ChannelActionType;
  payload: {
    isSender: boolean;
    channelUuid: string;
  };
}

export interface ChannelBeforeCloseAction {
  type: ChannelActionType;
  payload: {
    isSender: boolean;
    channelUuid: string;
    prevStatus: ChannelStatus;
  };
}

export interface ChannelAfterCloseAction {
  type: ChannelActionType;
  payload: {
    isSender: boolean;
    channelUuid: string;
    closeChannelEvents: ApiCloseChannelEvent[];
    settlingUntil: number | null;
  };
}

export type ChannelAction = ChannelBeforeCloseAction | ChannelAfterCloseAction | ChannelSimpleAction;

/* Receiver (of money) -> Seller, Sender (of money) -> Buyer */

export enum ReceiverChannelStatus {
  CanClose = '[Receiver] Can close', // Receiver can close first
  CanSettleOverPeriod = '[Receiver] Can settle over period', // Sender tried to close, receiver can settle over settlement period
  CanSettle = '[Receiver] Can settle', // Receiver can settle after settlement period ends
  IsClosing = '[Receiver] Is closing',
  IsClosed = '[Receiver] Is closed',
  CloseError = '[Receiver] Could not close',
}

export enum SenderChannelStatus {
  CanRequestClose = '[Sender] Can request close',
  IsRequestingClose = '[Sender] Is requesting close',
  RequestedClose = '[Sender] Requested close',
  CanClose = '[Sender] Can close',
  IsClosing = '[Sender] Is closing',
  IsClosed = '[Sender] Is closed',
  CloseError = '[Sender] Could not close',
}

export type ChannelStatus = ReceiverChannelStatus | SenderChannelStatus;

export interface ChannelMeta {
  status: ChannelStatus;

  message: string | null;
  messageCountdown: number | null;
  isSettled: boolean;
  isError: boolean;

  action: {
    icon: string;
    canPerform: boolean;
    isPerforming: boolean;
  };
}

export interface ChannelsTableItem {
  gravatar: SafeHtml;

  meter: {
    uuid: string;
    name: string;
  };

  channel: {
    uuid: string;
    bill: string;
    meta: ChannelMeta;
  };
}

export interface ChannelsMeter {
  uuid: string;
  name: string;
  gravatar: SafeHtml;
}
