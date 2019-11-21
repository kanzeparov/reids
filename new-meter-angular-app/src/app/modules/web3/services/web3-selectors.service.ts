import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { filter, switchMap } from 'rxjs/operators';

import { AppState } from '@app/app.state';

import {
  selectWeb3AccountAddress,
  selectWeb3Availability,
  selectWeb3IsPristine,
  selectWeb3Balance,
  selectWeb3EthBalance,
  selectWeb3MiptBalance
} from '@modules/web3/store/web3.selectors';

@Injectable()
export class Web3SelectorsService {

  constructor(private store$: Store<AppState>) { }

  isAvailable$() {
    return this.store$.pipe(select(selectWeb3Availability));
  }

  whenAvailable$() {
    return this.whenReady$().pipe(
      switchMap(() => this.isAvailable$()),
      filter((isAvailable: boolean) => isAvailable),
    );
  }

  whenUnavailable$() {
    return this.whenReady$().pipe(
      switchMap(() => this.isAvailable$()),
      filter((isAvailable: boolean) => !isAvailable),
    );
  }

  whenReady$() {
    return this.store$.pipe(
      select(selectWeb3IsPristine),
      filter((isPristine: boolean) => !isPristine),
    );
  }

  getAccountAddress$() {
    return this.store$.pipe(select(selectWeb3AccountAddress));
  }

  getBalance$() {
    return this.store$.select(selectWeb3Balance);
  }

  getEthBalance$() {
    return this.store$.select(selectWeb3EthBalance);
  }

  getMiptBalance$() {
    return this.store$.select(selectWeb3MiptBalance);
  }
}
