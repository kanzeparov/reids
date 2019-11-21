import { TestBed } from '@angular/core/testing';

import { Web3ActionsService } from './web3-actions.service';

describe('Web3ActionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Web3ActionsService = TestBed.get(Web3ActionsService);
    expect(service).toBeTruthy();
  });
});
