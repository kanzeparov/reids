import { Injectable } from '@angular/core';

import { combineLatest, Observable, Observer, of } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';

import { HexString } from '@shared/shared.types';

import { Web3Service } from '@modules/web3/services/web3.service';
import { Web3HelperService } from '@modules/web3/services/currency/web3-helper.service';
import { TransferPayload } from '@modules/web3/models/transfer.model';

@Injectable()
export class Web3EthService {

  constructor(
    private web3Service: Web3Service,
    private web3Helper: Web3HelperService,
  ) { }

  getBalance$() {
    return this.web3Service.accountAddress$.pipe(
      switchMap((accountAddress: HexString) => {
        return new Observable((observer: Observer<any>) => {
          this.web3Service.getBalance(
            accountAddress,
            this.web3Helper.handleGetBalance(observer),
          );
        });
      }),
      first(),
    );
  }

  deposit$({ from, to, amount }: TransferPayload) {
    if (!to) {
      throw new Error(`Receiver address can not be: ${to}`);
    }

    if (!amount) {
      throw new Error(`Eth amount can not be: ${amount}`);
    }

    if (!from) {
      throw new Error(`Sender address can not be: ${from}`);
    }

    return this.buildTransactionPayload$(
      of(from),
      of(to),
      of(this.web3Helper.toWei(amount)),
    ).pipe(
      switchMap(this.transfer$)
    );
  }

  private buildTransactionPayload$(
    from$: Observable<HexString>,
    to$: Observable<HexString>,
    amount$: Observable<number>,
  ) {
    return combineLatest(
      from$, to$, amount$
    ).pipe(
      map(this.combinePayload),
    );
  }

  transfer$ = ({ from, to, amount }: TransferPayload) => {
    return new Observable((observer: Observer<any>) => {
      this.web3Service.sendTransaction(
        { from, to, value: amount },
        this.web3Helper.handleTransfer(observer)
      );
    });
  }

  private combinePayload = ([ from, to, amount ]): TransferPayload => {
    return { from, to, amount };
  }
}
