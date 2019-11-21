import { TestBed } from '@angular/core/testing';

import { MetersStoreService } from './meters-store.service';

describe('MetersStoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MetersStoreService = TestBed.get(MetersStoreService);
    expect(service).toBeTruthy();
  });
});
