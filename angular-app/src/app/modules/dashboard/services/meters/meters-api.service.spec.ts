import { TestBed } from '@angular/core/testing';

import { MetersApiService } from './meters-api.service';

describe('MetersApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MetersApiService = TestBed.get(MetersApiService);
    expect(service).toBeTruthy();
  });
});
