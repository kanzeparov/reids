import { Currency, HexString } from '@shared/shared.types';

export interface AccountBalance {
  onchain: number;
  offchain: number;
  currency: Currency;
  tokenContract: HexString;
}

export interface AccountBalanceChain {
  balance: number;
  currency: Currency;
  tokenContract: HexString;
}

export interface TotalAccountBalanceItem {
  eth: number;
  mipt: number;
}

export interface TotalAccountBalance {
  onchain: TotalAccountBalanceItem;
  offchain: TotalAccountBalanceItem;
}
