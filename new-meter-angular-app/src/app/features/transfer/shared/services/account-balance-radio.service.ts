import { Injectable } from '@angular/core';
import { first, map, switchMap } from 'rxjs/operators';

import { Currency } from '@shared/shared.types';

import { AccountBalanceRadioItem } from '@features/transfer/shared/models/transfer-account.model';
import { AccountBalanceChain } from '@modules/account-balance/store/account-balance.model';
import { AccountBalanceSelectorsService } from '@modules/account-balance/services/account-balance-selectors.service';

import { DeviceSelectorsService } from '@modules/device/services/device-selectors.service';

@Injectable()
export class AccountBalanceRadioService {

  constructor(
    private deviceSelectors: DeviceSelectorsService,
    private accountBalanceSelectors: AccountBalanceSelectorsService,
  ) { }

  getItems$() {
    return this.deviceSelectors.whenLoaded$().pipe(
      switchMap(() => this.accountBalanceSelectors.getAllChainBalanceList$()),
      map(this.buildItems),
      first(),
    );
  }

  private buildItems = (accBalanceItems: AccountBalanceChain[]): AccountBalanceRadioItem[] => {
    return accBalanceItems.map((accBalanceItem: AccountBalanceChain) => {
      return { ...accBalanceItem, label: this.getLabel(accBalanceItem.currency) };
    });
  }

  private getLabel(currency: Currency): string {
    switch (currency) {
      case Currency.Eth: return 'Ethers';
      case Currency.Mipt: return 'REIDS18';
      default: throw new Error(`Could not recognize currency: ${currency}`);
    }
  }
}
