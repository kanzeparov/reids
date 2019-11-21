import { TestBed } from '@angular/core/testing';

import { ChannelsDrawerService } from './channels-drawer.service';

describe('ChannelsDrawerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChannelsDrawerService = TestBed.get(ChannelsDrawerService);
    expect(service).toBeTruthy();
  });
});
