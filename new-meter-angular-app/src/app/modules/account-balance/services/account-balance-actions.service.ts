import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { AppState } from '@app/app.state';

import { ApiAccountBalance } from '../api-account-balance.model';
import * as AccountBalanceActions from '../store/account-balance.actions';
import { AccountBalanceTransformService } from './account-balance-transform.service';

@Injectable()
export class AccountBalanceActionsService {

  constructor(
    private store$: Store<AppState>,
    private accountBalanceTransform: AccountBalanceTransformService,
  ) { }

  addBalance = (apiBalances: ApiAccountBalance[]) => {
    const accountBalances = this.accountBalanceTransform.normalizeForStore(apiBalances);

    this.store$.dispatch(new AccountBalanceActions.AddList(accountBalances));
  }
}
