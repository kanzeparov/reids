import { Component, Input, OnInit } from '@angular/core';
import { Currency } from '@shared/shared.types';
import { Observable } from 'rxjs';
import { AccountBalanceChain } from '@modules/account-balance/store/account-balance.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'dashboard-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class BalanceComponent implements OnInit {

  @Input('accountBalanceList$') initialAccountBalanceList$: Observable<AccountBalanceChain[]>;
  @Input() onChain: boolean;

  accountBalanceList$: Observable<AccountBalanceChain[]>;

  title = '';

  constructor() { }

  ngOnInit() {
    this.title = this.onChain ? 'on-chain balance' : 'off-chain balance';

    this.accountBalanceList$ = this.initialAccountBalanceList$.pipe(
      map(this.filterAccountBalanceList$.bind(this))
    );
  }

  private filterAccountBalanceList$(balanceList: AccountBalanceChain[]) {
    if (this.onChain) {
      return balanceList;
    }

    return balanceList.filter((balanceListItem: AccountBalanceChain) => {
      return balanceListItem.currency !== Currency.Eth;
    });
  }

}
