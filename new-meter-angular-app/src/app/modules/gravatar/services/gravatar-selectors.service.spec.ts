import { TestBed } from '@angular/core/testing';

import { GravatarSelectorsService } from './gravatar-selectors.service';

describe('GravatarSelectorsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GravatarSelectorsService = TestBed.get(GravatarSelectorsService);
    expect(service).toBeTruthy();
  });
});
