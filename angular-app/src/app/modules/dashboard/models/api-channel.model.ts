export enum ApiChannelState {
  Open = 0,
  Settling = 1,
  Settled = 2,
}

export interface ApiChannelsBalance {
  ticker: string;
  offchain: string;
  onchain: string;
  tokenContract: string;
}

export interface ApiChannelsListItem {
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

export interface ApiChannelsResponse {
  account: string;
  balance: ApiChannelsBalance[];
  channels: ApiChannelsListItem[];
}

/* Close Transaction Result */

export enum ApiCloseChannelEvent {
  DidStartSettling = 'DidStartSettling',
  DidClaim = 'DidClaim',
  DidSettle = 'DidSettle',
}

export interface ApiCloseChannelEventListItem {
  event: ApiCloseChannelEvent;
  args: {
    channelId: string;
  };
}

export interface ApiCloseChannelResponse {
  txID: string;
  events: ApiCloseChannelEventListItem[];
  channel?: ApiChannelsListItem;
}
