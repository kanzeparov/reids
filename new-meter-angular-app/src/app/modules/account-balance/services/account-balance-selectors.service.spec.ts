import { TestBed } from '@angular/core/testing';

import { AccountBalanceSelectorsService } from './account-balance-selectors.service';

describe('AccountBalanceSelectorsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AccountBalanceSelectorsService = TestBed.get(AccountBalanceSelectorsService);
    expect(service).toBeTruthy();
  });
});
