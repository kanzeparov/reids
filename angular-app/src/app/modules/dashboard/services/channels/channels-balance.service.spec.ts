import { TestBed } from '@angular/core/testing';

import { ChannelsBalanceService } from './channels-balance.service';

describe('ChannelsBalanceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChannelsBalanceService = TestBed.get(ChannelsBalanceService);
    expect(service).toBeTruthy();
  });
});
