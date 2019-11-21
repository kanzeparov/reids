import { TestBed } from '@angular/core/testing';

import { Web3EthService } from './web3-eth.service';

describe('Web3EthService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Web3EthService = TestBed.get(Web3EthService);
    expect(service).toBeTruthy();
  });
});
