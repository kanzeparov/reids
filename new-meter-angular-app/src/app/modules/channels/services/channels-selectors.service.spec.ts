import { TestBed } from '@angular/core/testing';

import { ChannelsSelectorsService } from './channels-selectors.service';

describe('ChannelsSelectorsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChannelsSelectorsService = TestBed.get(ChannelsSelectorsService);
    expect(service).toBeTruthy();
  });
});
