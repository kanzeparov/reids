import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { map, switchMap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

import { Currency, HexString } from '@shared/shared.types';

import { TransferPayload} from '@modules/web3/models/transfer.model';

import { Web3SelectorsService } from '@modules/web3/services/web3-selectors.service';
import { Web3MiptService } from '@modules/web3/services/currency/web3-mipt.service';
import { Web3EthService } from '@modules/web3/services/currency/web3-eth.service';

import { DeviceSelectorsService } from '@modules/device/services/device-selectors.service';
import { DeviceData } from '@modules/device/store/device.model';

@Injectable()
export class DepositService {

  constructor(
    private router: Router,

    private deviceSelectors: DeviceSelectorsService,

    private web3Selectors: Web3SelectorsService,
    private web3Mipt: Web3MiptService,
    private web3Eth: Web3EthService,
  ) { }

  get canTransfer$() {
    return combineLatest(
      this.web3Selectors.isAvailable$(),
      this.deviceSelectors.isLoaded$(),
    ).pipe(
      map(([ providerIsAvailable, deviceIsLoaded ]) => providerIsAvailable && deviceIsLoaded)
    );
  }

  transfer$(amount: number, currency: Currency, tokenContract: HexString) {
    const combinedData$ = combineLatest(
      this.web3Selectors.getAccountAddress$(),
      this.deviceSelectors.getDeviceData$(),
    );

    return combinedData$.pipe(
      map(([web3AccountAddress, deviceData]: [HexString, DeviceData]) => ({
        from: web3AccountAddress,
        to: deviceData.accountAddress,
        amount,
        tokenContract,
      })),
      switchMap((payload: TransferPayload) => {
        return this.performTransfer$(currency, payload);
      }),
    );
  }

  private performTransfer$ (currency: Currency, payload: TransferPayload) {
    switch (currency) {
      case Currency.Eth:
        return this.web3Eth.deposit$(payload);

      case Currency.Mipt:
        return this.web3Mipt.deposit$(payload);

      default:
        throw new Error(`Could not find transfer method for currency: ${currency}`);
    }
  }
}
