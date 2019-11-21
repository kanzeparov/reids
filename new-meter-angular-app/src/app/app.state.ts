import { GravatarState } from '@modules/gravatar/store/gravatar.state';
import { ChannelsState } from '@modules/channels/store/channels.state';
import { DeviceState } from '@modules/device/store/device.state';
import { AccountBalanceState } from '@modules/account-balance/store/account-balance.state';
import { Web3State } from '@modules/web3/store/web3.state';

export interface AppState {
  readonly gravatar: GravatarState;
  readonly channels: ChannelsState;
  readonly device: DeviceState;
  readonly accountBalance: AccountBalanceState;
  readonly web3: Web3State;
}
