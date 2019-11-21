import { TestBed } from '@angular/core/testing';

import { Web3HelperService } from './web3-helper.service';

describe('Web3HelperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Web3HelperService = TestBed.get(Web3HelperService);
    expect(service).toBeTruthy();
  });
});
