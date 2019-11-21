import { TestBed } from '@angular/core/testing';

import { ApiRouterService } from './api-router.service';

describe('ApiRouterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ApiRouterService = TestBed.get(ApiRouterService);
    expect(service).toBeTruthy();
  });
});
