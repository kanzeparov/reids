import { TestBed } from '@angular/core/testing';

import { MeterReportsStoreService } from './meter-reports-store.service';

describe('MeterReportsStoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MeterReportsStoreService = TestBed.get(MeterReportsStoreService);
    expect(service).toBeTruthy();
  });
});
