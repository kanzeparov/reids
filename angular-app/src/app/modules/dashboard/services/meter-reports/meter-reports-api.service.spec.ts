import { TestBed } from '@angular/core/testing';

import { MeterReportsApiService } from './meter-reports-api.service';

describe('MeterReportsApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MeterReportsApiService = TestBed.get(MeterReportsApiService);
    expect(service).toBeTruthy();
  });
});
