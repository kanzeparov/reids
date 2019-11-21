import { TestBed } from '@angular/core/testing';

import { GravatarStoreService } from './gravatar-store.service';

describe('GravatarStoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GravatarStoreService = TestBed.get(GravatarStoreService);
    expect(service).toBeTruthy();
  });
});
