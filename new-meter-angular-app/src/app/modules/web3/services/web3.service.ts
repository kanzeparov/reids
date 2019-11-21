import { Injectable } from '@angular/core';

import { interval, of } from 'rxjs';
import { distinctUntilChanged, filter, first, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { Web3ProviderService } from './web3-provider.service';

const Web3 = (window as any).Web3;

@Injectable()
export class Web3Service {

  POLL_INTERVAL = 3000;

  isAvailable$ = interval(this.POLL_INTERVAL).pipe(
    startWith(0),
    switchMap(() => of(this.web3Provider.isAvailable)),
    distinctUntilChanged(),
    shareReplay(),
  );

  constructor(
    private web3Provider: Web3ProviderService,
  ) { }

  get web3() {
    return new Web3(this.web3Provider.getProvider());
  }

  get accountAddress$() {
    return of(this.web3Provider.getAddress()).pipe(first());
  }

  whenGetAvailable$() {
    return this.isAvailable$.pipe(
      filter((isAvailable: boolean) => isAvailable),
    );
  }

  whenGetUnavailable$() {
    return this.isAvailable$.pipe(
      filter((isAvailable: boolean) => !isAvailable),
    );
  }

  /* Delegated methods */

  getBalance(...args) {
    return this.web3.eth.getBalance(...args);
  }

  sendTransaction(...args) {
    return this.web3.eth.sendTransaction(...args);
  }

  getContract(...args) {
    return this.web3.eth.contract(...args);
  }
}
