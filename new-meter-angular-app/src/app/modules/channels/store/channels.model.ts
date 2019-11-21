import { ApiChannelState } from '../api-channel.model';

export interface ChannelItem {
  uuid: string;
  meterUuid: string;
  value: number;
  spent: number;
  bill: number;
  state: ApiChannelState;
  settlingUntil: number;
}

export interface ChannelsCollection {
  [uuid: string]: ChannelItem;
}
