import { TestBed } from '@angular/core/testing';

import { ChannelsActionsService } from './channels-actions.service';

describe('ChannelsActionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChannelsActionsService = TestBed.get(ChannelsActionsService);
    expect(service).toBeTruthy();
  });
});
