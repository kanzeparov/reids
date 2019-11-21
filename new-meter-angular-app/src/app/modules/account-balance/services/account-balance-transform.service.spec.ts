import { TestBed } from '@angular/core/testing';

import { AccountBalanceTransformService } from './account-balance-transform.service';

describe('AccountBalanceTransformService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AccountBalanceTransformService = TestBed.get(AccountBalanceTransformService);
    expect(service).toBeTruthy();
  });
});
