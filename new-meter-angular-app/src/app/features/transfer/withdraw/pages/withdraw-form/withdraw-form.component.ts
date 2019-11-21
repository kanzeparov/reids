import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { first, switchMap } from 'rxjs/operators';
import { untilDestroyed } from 'ngx-take-until-destroy';

import { Currency, HexString } from '@shared/shared.types';

import { TransferFlowService } from '@features/transfer/shared/services/transfer-flow.service';
import { WithdrawService } from '@features/transfer/withdraw/services/withdraw.service';
import { AccountBalanceRadioService } from '@features/transfer/shared/services/account-balance-radio.service';
import { AccountBalanceSelectorsService } from '@modules/account-balance/services/account-balance-selectors.service';
import { DeviceSelectorsService } from '@modules/device/services/device-selectors.service';

@Component({
  selector: 'app-withdraw-form',
  templateUrl: './withdraw-form.component.html',
  styleUrls: ['./withdraw-form.component.scss'],
  providers: [
    WithdrawService,
    AccountBalanceRadioService,
  ],
})
export class WithdrawFormComponent implements OnInit, OnDestroy {
  transferAccounts$ = this.accountBalanceRadio.getItems$();
  canTransfer$ = this.withdrawService.canTransfer$;
  isTransferPending$ = this.transferFlow.isPending$;

  withdrawForm = new FormGroup({
    account: new FormControl(null, [
      Validators.required,
    ]),
    amount: new FormControl(),
  });

  whenDeviceLoaded$ = this.deviceSelectors.whenLoaded$();

  totalBalance$ = this.whenDeviceLoaded$.pipe(
    switchMap(() => this.accountBalanceSelectors.getTotalBalance$()),
    first(),
    untilDestroyed(this),
  );

  constructor(
    private deviceSelectors: DeviceSelectorsService,

    private accountBalanceSelectors: AccountBalanceSelectorsService,
    private accountBalanceRadio: AccountBalanceRadioService,

    private withdrawService: WithdrawService,
    private transferFlow: TransferFlowService,
  ) { }

  ngOnInit() {
    this.accountControl.valueChanges
      .pipe(
        untilDestroyed(this),
      )
      .subscribe(() => {
        this.amountControl.setValidators(this.getAmountValidators());
        this.amountControl.updateValueAndValidity();
      });

    this.transferFlow.preparing();
  }

  getAmountValidators() {
    const maxValue = this.accountControl.value.balance;

    return [
      Validators.required,
      Validators.min(0),
      Validators.max(maxValue),
      Validators.pattern(/^\d+(\.\d{1,100})?$/),
    ];
  }

  ngOnDestroy() { }

  get accountControl () {
    return this.withdrawForm.get('account');
  }

  get currency() {
    if (!this.accountControl.value) {
      return null;
    }

    return this.accountControl.value.currency;
  }

  get currencyIsMipt () {
    return this.currency === Currency.Mipt;
  }

  get amountControl () {
    return this.withdrawForm.get('amount');
  }

  get amount () {
    return this.amountControl.value;
  }

  onSubmit() {
    if (this.withdrawForm.invalid) {
      return;
    }

    this.transferFlow.pending();

    const { tokenContract } = this.accountControl.value;
    this.withdrawService
      .transfer$(this.amount, tokenContract)
      .subscribe(
        ({ tx }: { tx: HexString }) => this.transferFlow.success({
          transactionHash: tx,
          redirectUrl: '/withdraw/success',
        }),
        (error: any) => this.transferFlow.error({
          errors: [error],
          redirectUrl: '/withdraw/error',
        }),
      );
  }

}
