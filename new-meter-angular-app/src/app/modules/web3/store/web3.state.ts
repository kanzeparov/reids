import { Web3Balance, Web3Meta } from './web3.model';
import { HexString } from '@shared/shared.types';

export interface Web3State {
  accountAddress: HexString;
  balance: Web3Balance;
  meta: Web3Meta;
}
