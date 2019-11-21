import { TestBed } from '@angular/core/testing';

import { DeviceSelectorsService } from './device-selectors.service';

describe('DeviceSelectorsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DeviceSelectorsService = TestBed.get(DeviceSelectorsService);
    expect(service).toBeTruthy();
  });
});
