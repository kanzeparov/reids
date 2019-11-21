import { TestBed } from '@angular/core/testing';

import { ChannelsStatusService } from './channels-status.service';

describe('ChannelsStatusService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChannelsStatusService = TestBed.get(ChannelsStatusService);
    expect(service).toBeTruthy();
  });
});
