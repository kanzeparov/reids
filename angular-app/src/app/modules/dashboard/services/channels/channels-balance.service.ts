import { Injectable } from '@angular/core';
import { toSafeNumber } from '@utils/number.util';
import { ApiChannelsBalance } from '@modules/dashboard/models/api-channel.model';
import { PROPER_TOKEN_EXPONENT, TOKEN_EXPONENT } from '@modules/dashboard/dashboard.constant';

@Injectable()
export class ChannelsBalanceService {
  ETH_SYMBOL = 'ETH';
  MIPT_SYMBOL = 'REIDSCoin_v18';

  constructor() { }

  getEthBalance(balances: ApiChannelsBalance[]) {
    const ethBalance = this.findBalanceFor(balances, this.ETH_SYMBOL);

    return {
      onchain: this.normalizeToken(ethBalance.onchain),
    };
  }

  getMiptBalance(balances: ApiChannelsBalance[]) {
    const miptBalance = this.findBalanceFor(balances, this.MIPT_SYMBOL);

    return {
      onchain: this.normalizeToken(miptBalance.onchain),
      offchain: this.normalizeToken(miptBalance.offchain),
    };
  }

  private findBalanceFor(balances: ApiChannelsBalance[], ticker: string) {
    return balances.find((b: ApiChannelsBalance) => b.ticker === ticker);
  }

  private normalizeToken(rawToken: string) {
    return toSafeNumber(rawToken) * PROPER_TOKEN_EXPONENT;
  }
}
