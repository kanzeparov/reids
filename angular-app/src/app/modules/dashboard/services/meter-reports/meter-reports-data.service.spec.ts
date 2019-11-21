import { TestBed } from '@angular/core/testing';

import { MeterReportsDataService } from './meter-reports-data.service';

describe('MeterReportsDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MeterReportsDataService = TestBed.get(MeterReportsDataService);
    expect(service).toBeTruthy();
  });
});
