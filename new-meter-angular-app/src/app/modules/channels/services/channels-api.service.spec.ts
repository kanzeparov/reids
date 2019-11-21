import { TestBed } from '@angular/core/testing';

import { ChannelsApiService } from './channels-api.service';

describe('ChannelsApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChannelsApiService = TestBed.get(ChannelsApiService);
    expect(service).toBeTruthy();
  });
});
