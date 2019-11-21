import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { switchMap } from 'rxjs/operators';
import { untilDestroyed } from 'ngx-take-until-destroy';

import { Currency, HexString } from '@shared/shared.types';

import { TransferFlowService } from '@features/transfer/shared/services/transfer-flow.service';
import { DepositService } from '@features/transfer/deposit/services/deposit.service';
import { AccountBalanceRadioService } from '@features/transfer/shared/services/account-balance-radio.service';

import { Web3SelectorsService } from '@modules/web3/services/web3-selectors.service';

@Component({
  selector: 'app-deposit-form',
  templateUrl: './deposit-form.component.html',
  styleUrls: ['./deposit-form.component.scss'],
  providers: [
    DepositService,
    AccountBalanceRadioService,
  ],
})
export class DepositFormComponent implements OnInit, OnDestroy {
  transferAccounts$ = this.accountBalanceRadio.getItems$();
  canTransfer$ = this.depositService.canTransfer$;
  isTransferPending$ = this.transferFlow.isPending$;

  depositForm = new FormGroup({
    account: new FormControl(null, [
      Validators.required,
    ]),
    amount: new FormControl(),
  });

  web3AccountAddress$ = this.web3Selectors.getAccountAddress$();

  constructor(
    private accountBalanceRadio: AccountBalanceRadioService,
    private depositService: DepositService,
    private web3Selectors: Web3SelectorsService,
    private transferFlow: TransferFlowService,
  ) { }

  ngOnInit() {
    this.accountControl.valueChanges
      .pipe(
        switchMap(() => this.getWeb3Balance$()),
        untilDestroyed(this),
      )
      .subscribe((maxValue: number) => {
        this.amountControl.setValidators(this.getAmountValidators(maxValue));
        this.amountControl.updateValueAndValidity();
      });

    this.transferFlow.preparing();
  }

  ngOnDestroy() { }

  getAmountValidators(maxValue: number) {
    return [
      Validators.required,
      Validators.min(0),
      Validators.max(maxValue),
      Validators.pattern(/^\d+(\.\d{1,100})?$/),
    ];
  }

  get accountControl() {
    return this.depositForm.get('account');
  }

  get currency() {
    if (!this.accountControl.value) {
      return null;
    }

    return this.accountControl.value.currency;
  }

  get tokenContract() {
    return this.accountControl.value ?
      this.accountControl.value.tokenContract :
      null;
  }

  get amountControl() {
    return this.depositForm.get('amount');
  }

  get amount() {
    return this.amountControl.value ?
      Number(this.amountControl.value) :
      null;
  }

  get currencyIsMipt() {
    return this.currency === Currency.Mipt;
  }

  getWeb3Balance$() {
    return this.currencyIsMipt ?
      this.web3Selectors.getMiptBalance$() :
      this.web3Selectors.getEthBalance$();
  }

  onSubmit() {
    if (this.depositForm.invalid) {
      return;
    }

    this.transferFlow.pending();

    const { tokenContract, currency } = this.accountControl.value;
    this.depositService.transfer$(
      this.amount,
      currency,
      tokenContract,
    ).subscribe(
      (transactionHash: HexString) => this.transferFlow.success({
        transactionHash,
        redirectUrl: '/deposit/success',
      }),
      (error: any) => this.transferFlow.error({
        errors: [ error ],
        redirectUrl: '/deposit/error',
      }),
    );
  }

}
