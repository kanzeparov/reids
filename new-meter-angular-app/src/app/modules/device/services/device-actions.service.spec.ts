import { TestBed } from '@angular/core/testing';

import { DeviceActionsService } from './device-actions.service';

describe('DeviceActionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DeviceActionsService = TestBed.get(DeviceActionsService);
    expect(service).toBeTruthy();
  });
});
