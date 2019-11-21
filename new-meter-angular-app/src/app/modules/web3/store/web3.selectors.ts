import { createSelector, createFeatureSelector } from '@ngrx/store';

import { AppState } from '@app/app.state';

import { Web3State } from './web3.state';
import { Web3Balance, Web3Meta } from './web3.model';

export const selectWeb3 = createFeatureSelector<AppState, Web3State>(
  'web3'
);

export const selectWeb3AccountAddress = createSelector(
  selectWeb3,
  (web3State: Web3State) => web3State.accountAddress
);

export const selectWeb3Balance = createSelector(
  selectWeb3,
  (web3State: Web3State) => web3State.balance
);

export const selectWeb3EthBalance = createSelector(
  selectWeb3Balance,
  (web3Balance: Web3Balance) => web3Balance.eth
);

export const selectWeb3MiptBalance = createSelector(
  selectWeb3Balance,
  (web3Balance: Web3Balance) => web3Balance.mipt
);

export const selectWeb3Meta = createSelector(
  selectWeb3,
  (web3State: Web3State) => web3State.meta
);

export const selectWeb3IsPristine = createSelector(
  selectWeb3Meta,
  (web3Meta: Web3Meta) => web3Meta.isPristine
);

export const selectWeb3Availability = createSelector(
  selectWeb3Meta,
  (web3Meta: Web3Meta) => web3Meta.isAvailable
);
