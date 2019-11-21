import { TestBed } from '@angular/core/testing';

import { AccountBalanceActionsService } from './account-balance-actions.service';

describe('AccountBalanceActionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AccountBalanceActionsService = TestBed.get(AccountBalanceActionsService);
    expect(service).toBeTruthy();
  });
});
