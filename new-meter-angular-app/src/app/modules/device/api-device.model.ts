import { ApiChannelsItem } from '@modules/channels/api-channel.model';
import { ApiAccountBalance } from '@modules/account-balance/api-account-balance.model';

export interface ApiDeviceResponse {
  account: string;
  balance: ApiAccountBalance[];
  channels: ApiChannelsItem[];
}
