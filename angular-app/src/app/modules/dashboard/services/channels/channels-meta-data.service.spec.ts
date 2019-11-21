import { TestBed } from '@angular/core/testing';

import { ChannelsMetaDataService } from './channels-meta-data.service';

describe('ChannelsMetaDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChannelsMetaDataService = TestBed.get(ChannelsMetaDataService);
    expect(service).toBeTruthy();
  });
});
