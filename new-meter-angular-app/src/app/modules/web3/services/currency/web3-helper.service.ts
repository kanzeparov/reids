import { Injectable, NgZone } from '@angular/core';
import { Observer } from 'rxjs';
import { BigNumber } from 'bignumber.js';

import { TOKEN_EXPONENT } from '@shared/shared.constant';

import { Web3Service } from '@modules/web3/services/web3.service';

@Injectable()
export class Web3HelperService {

  constructor(
    private web3Service: Web3Service,
    private ngZone: NgZone,
  ) { }

  toWei(amount: number) {
    return this.web3Service.web3.toWei(amount, 'ether');
  }

  handleTransfer(observer: Observer<any>) {
    return (error, response) => {
      this.ngZone.run(() => {
        if (error) {
          observer.error(error);
        }

        if (response) {
          observer.next(response);
        }

        observer.complete();
      });
    };
  }

  handleGetBalance(observer: Observer<any>) {
    return (error, rawBalance) => {
      if (error) {
        observer.error(error);
      }

      if (rawBalance) {
        const balance = new BigNumber(rawBalance).toNumber() * TOKEN_EXPONENT;
        observer.next(balance);
      }

      observer.complete();
    };
  }
}
