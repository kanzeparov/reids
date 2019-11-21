import { TestBed } from '@angular/core/testing';

import { MeterReportsUpdatesService } from './meter-reports-updates.service';

describe('MeterReportsUpdatesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MeterReportsUpdatesService = TestBed.get(MeterReportsUpdatesService);
    expect(service).toBeTruthy();
  });
});
