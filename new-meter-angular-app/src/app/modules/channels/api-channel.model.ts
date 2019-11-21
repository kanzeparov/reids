export enum ApiChannelState {
  Open = 0,
  Settling = 1,
  Settled = 2,
}

export interface ApiChannelsItem {
  sender: string;
  receiver: string;
  channelId: string;
  value: string;
  spent: string;
  state: ApiChannelState;
  tokenContract: string;
  settlementPeriod: string;
  settlingUntil: number;
}

/* Close Transaction Result */

export enum ApiCloseChannelEvent {
  DidStartSettling = 'DidStartSettling',
  DidClaim = 'DidClaim',
  DidSettle = 'DidSettle',
}

export interface ApiCloseChannelEventsItem {
  event: ApiCloseChannelEvent;
  args: {
    channelId: string;
  };
}

export interface ApiCloseChannelResponse {
  txID: string;
  events: ApiCloseChannelEventsItem[];
  channel?: ApiChannelsItem;
}
