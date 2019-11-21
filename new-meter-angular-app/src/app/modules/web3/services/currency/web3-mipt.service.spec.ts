import { TestBed } from '@angular/core/testing';

import { Web3MiptService } from './web3-mipt.service';

describe('Web3MiptService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Web3MiptService = TestBed.get(Web3MiptService);
    expect(service).toBeTruthy();
  });
});
