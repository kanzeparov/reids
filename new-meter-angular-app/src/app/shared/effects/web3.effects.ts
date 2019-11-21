import { Injectable } from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { Effect } from '@ngrx/effects';

import { combineLatest } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';

import { HexString } from '@shared/shared.types';

import { Web3Service } from '@modules/web3/services/web3.service';
import { Web3EthService } from '@modules/web3/services/currency/web3-eth.service';
import { Web3MiptService } from '@modules/web3/services/currency/web3-mipt.service';
import { Web3SelectorsService } from '@modules/web3/services/web3-selectors.service';

import { DeviceSelectorsService } from '@modules/device/services/device-selectors.service';
import { AccountBalanceSelectorsService } from '@modules/account-balance/services/account-balance-selectors.service';
import { Web3ActionsService } from '@modules/web3/services/web3-actions.service';

@Injectable()
export class Web3Effects {

  constructor(
    private router: Router,

    private deviceSelectors: DeviceSelectorsService,
    private accountBalanceSelectors: AccountBalanceSelectorsService,

    private web3Service: Web3Service,
    private web3Eth: Web3EthService,
    private web3Mipt: Web3MiptService,

    private web3Selectors: Web3SelectorsService,
    private web3Actions: Web3ActionsService,
  ) { }

  whenDeviceLoaded$ = this.deviceSelectors.whenLoaded$();

  /* Set or reset data */

  @Effect({ dispatch: false })
  addWeb3Data$ = this.whenDeviceLoaded$.pipe(
    switchMap(() => this.web3Service.isAvailable$),

    tap((isAvailable: boolean) => {
      if (isAvailable) {
        this.web3Service.accountAddress$.subscribe(this.web3Actions.addAccountAddress);
        this.web3Eth.getBalance$().subscribe(this.web3Actions.addEthBalance);
        this.getWeb3MiptBalance$().subscribe(this.web3Actions.addMiptBalance);
      } else {
        this.web3Actions.addAccountAddress('');
        this.web3Actions.addEthBalance(0);
        this.web3Actions.addMiptBalance(0);
      }

      this.web3Actions.updateMeta({ isAvailable });
    }),
  );

  /* Update Balance */

  @Effect({ dispatch: false })
  updateEthBalance$ = this.router.events.pipe(
    filter((event: RouterEvent) => event instanceof NavigationEnd),
    filter((event: RouterEvent) => ['/deposit/form'].includes(event.url)),

    switchMap(() => combineLatest(
      this.web3Eth.getBalance$(),
      this.web3Selectors.getEthBalance$(),
    )),

    tap(([ newBalance, prevBalance ]: [number, number]) => {
      if (newBalance === prevBalance) {
        return;
      }

      this.web3Actions.addEthBalance(newBalance);
    }),
  );

  @Effect({ dispatch: false })
  updateMiptBalance$ = this.router.events.pipe(
    filter((event: RouterEvent) => event instanceof NavigationEnd),
    filter((event: RouterEvent) => ['/deposit/form'].includes(event.url)),

    switchMap(() => combineLatest(
      this.getWeb3MiptBalance$(),
      this.web3Selectors.getMiptBalance$(),
    )),

    tap(([ newBalance, prevBalance ]: [number, number]) => {
      if (newBalance === prevBalance) {
        return;
      }

      this.web3Actions.addMiptBalance(newBalance);
    }),
  );

  private getWeb3MiptBalance$() {
    return combineLatest(
      this.web3Service.accountAddress$,
      this.accountBalanceSelectors.getMiptTokenContract$(),
    ).pipe(
      switchMap(([accountAddress, tokenContract]: [HexString, HexString]) => {
        return this.web3Mipt.getBalance$({ accountAddress, tokenContract });
      }),
    );
  }

}
