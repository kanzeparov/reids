import { TestBed } from '@angular/core/testing';

import { GravatarActionsService } from './gravatar-actions.service';

describe('GravatarActionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GravatarActionsService = TestBed.get(GravatarActionsService);
    expect(service).toBeTruthy();
  });
});
