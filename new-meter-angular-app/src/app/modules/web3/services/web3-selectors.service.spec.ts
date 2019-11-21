import { TestBed } from '@angular/core/testing';

import { Web3SelectorsService } from './web3-selectors.service';

describe('Web3SelectorsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Web3SelectorsService = TestBed.get(Web3SelectorsService);
    expect(service).toBeTruthy();
  });
});
