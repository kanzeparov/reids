import { TestBed } from '@angular/core/testing';

import { TransferApiService } from './transfer-api.service';

describe('TransferApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TransferApiService = TestBed.get(TransferApiService);
    expect(service).toBeTruthy();
  });
});
