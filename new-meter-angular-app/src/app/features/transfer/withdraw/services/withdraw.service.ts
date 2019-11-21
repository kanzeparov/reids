import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { map, switchMap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

import { HexString } from '@shared/shared.types';

import { TransferPayload} from '@modules/web3/models/transfer.model';
import { TransferApiService } from '@modules/transfer/services/transfer-api.service';

import { Web3HelperService } from '@modules/web3/services/currency/web3-helper.service';
import { Web3SelectorsService } from '@modules/web3/services/web3-selectors.service';

import { DeviceSelectorsService } from '@modules/device/services/device-selectors.service';
import { DeviceData } from '@modules/device/store/device.model';

@Injectable()
export class WithdrawService {

  constructor(
    private router: Router,

    private deviceSelectors: DeviceSelectorsService,
    private web3Selectors: Web3SelectorsService,
    private web3Helper: Web3HelperService,
    private transferApi: TransferApiService,
  ) { }

  get canTransfer$() {
    return combineLatest(
      this.web3Selectors.isAvailable$(),
      this.deviceSelectors.isLoaded$(),
    ).pipe(
      map(([ providerIsAvailable, deviceIsLoaded ]) => providerIsAvailable && deviceIsLoaded)
    );
  }

  transfer$(amount: number, tokenContract: HexString) {
    const combinedData$ = combineLatest(
      this.web3Selectors.getAccountAddress$(),
      this.deviceSelectors.getDeviceData$(),
    );

    return combinedData$.pipe(
      map(([personalAccountAddress, deviceData]: [HexString, DeviceData]) => ({
        from: deviceData.accountAddress,
        to: personalAccountAddress,
        amount: this.web3Helper.toWei(amount),
        tokenContract,
      })),
      switchMap((payload: TransferPayload) => {
        return this.transferApi.transfer$(payload);
      }),
    );
  }
}
