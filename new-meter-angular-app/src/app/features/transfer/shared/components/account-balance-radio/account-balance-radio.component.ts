import { Component, forwardRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { AccountBalanceRadioItem } from '@features/transfer/shared/models/transfer-account.model';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-account-balance-radio',
  templateUrl: './account-balance-radio.component.html',
  styleUrls: ['./account-balance-radio.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AccountBalanceRadioComponent),
      multi: true,
    }
  ],
})
export class AccountBalanceRadioComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() accounts: AccountBalanceRadioItem[];
  accountCurrency: string;

  isDisabled = false;
  emitOnChange = (_) => {};
  emitOnTouched = () => {};

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    const ignoreChanges = (
      !changes.accounts ||
      changes.accounts.currentValue === null ||
      this.accountCurrency !== undefined
    );

    if (ignoreChanges) {
      return;
    }

    this.accountCurrency = changes.accounts.currentValue[0].currency;
    this.onChange(this.accountCurrency);
  }

  onChange = (currency: string) => {
    setTimeout(() => {
      const account = this.accounts.find((acc: AccountBalanceRadioItem) => acc.currency === currency);

      this.emitOnChange(account);
      this.emitOnTouched();
    });
  }

  registerOnChange(fn: any) {
    this.emitOnChange = fn;
  }

  registerOnTouched(fn: any) {
    this.emitOnTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.isDisabled = isDisabled;
  }

  writeValue(initialAccount: AccountBalanceRadioItem) {
    if (!initialAccount) {
      return;
    }

    this.accountCurrency = initialAccount.currency;
  }

}
