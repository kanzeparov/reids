import { Injectable } from '@angular/core';

import { Currency } from '@shared/shared.types';
import { normalizeToken } from '@utils/money.util';

import { AccountBalance } from '../store/account-balance.model';
import { ApiAccountBalance, ApiAccountBalanceCurrency } from '../api-account-balance.model';

@Injectable()
export class AccountBalanceTransformService {

  constructor() { }

  normalizeForStore(apiBalances: ApiAccountBalance[]) {
    return apiBalances.map((apiBalance: ApiAccountBalance): AccountBalance => {
      return {
        onchain: normalizeToken(apiBalance.onchain),
        offchain: normalizeToken(apiBalance.offchain),
        currency: this.getCurrency(apiBalance.ticker),
        tokenContract: apiBalance.tokenContract,
      };
    });
  }

  private getCurrency(apiCurrency: ApiAccountBalanceCurrency) {
    switch (apiCurrency) {
      case ApiAccountBalanceCurrency.Eth: return Currency.Eth;
      case ApiAccountBalanceCurrency.MiptToken: return Currency.Mipt;
      default: throw new Error(`Could not recognize currency: ${apiCurrency}`);
    }
  }
}
