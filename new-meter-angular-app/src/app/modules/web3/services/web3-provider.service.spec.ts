import { TestBed } from '@angular/core/testing';

import { Web3ProviderService } from './web3-provider.service';

describe('Web3ProviderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Web3ProviderService = TestBed.get(Web3ProviderService);
    expect(service).toBeTruthy();
  });
});
