import { TestBed } from '@angular/core/testing';

import { ChartReportsApiService } from './chart-reports-api.service';

describe('ChartReportsApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChartReportsApiService = TestBed.get(ChartReportsApiService);
    expect(service).toBeTruthy();
  });
});
