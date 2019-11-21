import { createFeatureSelector, createSelector } from '@ngrx/store';

import { Currency } from '@shared/shared.types';
import { AppState } from '@app/app.state';

import { AccountBalanceState } from './account-balance.state';
import { AccountBalance } from './account-balance.model';

export const selectAccountBalance = createFeatureSelector<AppState, AccountBalanceState>(
  'accountBalance'
);

export const selectEthAccountBalance = createSelector(
  selectAccountBalance,
  (accountsState: AccountBalanceState) => {
    return accountsState.list.find((acc: AccountBalance) => acc.currency === Currency.Eth);
  }
);

export const selectMiptAccountBalance = createSelector(
  selectAccountBalance,
  (accountsState: AccountBalanceState) => {
    return accountsState.list.find((acc: AccountBalance) => acc.currency === Currency.Mipt);
  }
);

export const selectMiptTokenContract = createSelector(
  selectMiptAccountBalance,
  (miptAccBalance: AccountBalance) => miptAccBalance.tokenContract
);

export const selectTotalAccountBalance = createSelector(
  selectEthAccountBalance,
  selectMiptAccountBalance,
  (ethBalance: AccountBalance, miptBalance: AccountBalance) => {
    return {
      onchain: {
        eth: ethBalance.onchain,
        mipt: miptBalance.onchain,
      },
      offchain: {
        eth: ethBalance.offchain,
        mipt: miptBalance.offchain,
      },
    };
  }
);

export const selectAllChainAccountBalanceList = createSelector(
  selectEthAccountBalance,
  selectMiptAccountBalance,
  (ethBalance: AccountBalance, miptBalance: AccountBalance) => {
    return [
      {
        currency: ethBalance.currency,
        balance: ethBalance.onchain + ethBalance.offchain,
        tokenContract: ethBalance.tokenContract,
      },
      {
        currency: miptBalance.currency,
        balance: miptBalance.onchain + miptBalance.offchain,
        tokenContract: miptBalance.tokenContract,
      },
    ];
  }
);

export const selectOnchainAccountBalanceList = createSelector(
  selectEthAccountBalance,
  selectMiptAccountBalance,
  (ethBalance: AccountBalance, miptBalance: AccountBalance) => {
    return [
      {
        currency: ethBalance.currency,
        balance: ethBalance.onchain,
        tokenContract: ethBalance.tokenContract,
      },
      {
        currency: miptBalance.currency,
        balance: miptBalance.onchain,
        tokenContract: miptBalance.tokenContract,
      },
    ];
  }
);

export const selectOffchainAccountBalanceList = createSelector(
  selectEthAccountBalance,
  selectMiptAccountBalance,
  (ethBalance: AccountBalance, miptBalance: AccountBalance) => {
    return [
      {
        currency: ethBalance.currency,
        balance: ethBalance.offchain,
        tokenContract: ethBalance.tokenContract,
      },
      {
        currency: miptBalance.currency,
        balance: miptBalance.offchain,
        tokenContract: miptBalance.tokenContract,
      },
    ];
  }
);
