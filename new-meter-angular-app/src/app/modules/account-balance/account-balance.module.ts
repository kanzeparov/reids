import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { accountBalanceReducer } from './store/account-balance.reducer';

import { AccountBalanceActionsService } from './services/account-balance-actions.service';
import { AccountBalanceSelectorsService } from './services/account-balance-selectors.service';
import { AccountBalanceTransformService } from './services/account-balance-transform.service';

@NgModule({
  imports: [
    StoreModule.forFeature('accountBalance', accountBalanceReducer),
  ],
  providers: [
    AccountBalanceActionsService,
    AccountBalanceSelectorsService,
    AccountBalanceTransformService,
  ],
})
export class AccountBalanceModule { }
