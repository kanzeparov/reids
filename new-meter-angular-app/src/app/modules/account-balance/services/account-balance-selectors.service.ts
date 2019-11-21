import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { AppState } from '@app/app.state';

import {
  selectOffchainAccountBalanceList,
  selectOnchainAccountBalanceList,
  selectAllChainAccountBalanceList,
  selectTotalAccountBalance,
  selectMiptTokenContract,
} from '../store/account-balance.selectors';

@Injectable()
export class AccountBalanceSelectorsService {

  constructor(private store$: Store<AppState>) { }

  getMiptTokenContract$() {
    return this.store$.pipe(select(selectMiptTokenContract));
  }

  getTotalBalance$() {
    return this.store$.pipe(select(selectTotalAccountBalance));
  }

  getAllChainBalanceList$() {
    return this.store$.pipe(select(selectAllChainAccountBalanceList));
  }

  getOnchainBalanceList$() {
    return this.store$.pipe(select(selectOnchainAccountBalanceList));
  }

  getOffchainBalanceList$() {
    return this.store$.pipe(select(selectOffchainAccountBalanceList));
  }
}
