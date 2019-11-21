import { TestBed } from '@angular/core/testing';

import { ChannelsDataService } from './channels-data.service';

describe('ChannelsDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChannelsDataService = TestBed.get(ChannelsDataService);
    expect(service).toBeTruthy();
  });
});
