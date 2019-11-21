import { TestBed } from '@angular/core/testing';

import { AccountBalanceRadioService } from './account-balance-radio.service';

describe('AccountBalanceRadioService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AccountBalanceRadioService = TestBed.get(AccountBalanceRadioService);
    expect(service).toBeTruthy();
  });
});
