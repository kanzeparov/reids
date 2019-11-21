import { TestBed } from '@angular/core/testing';

import { DashboardChannelsService } from './dashboard-channels.service';

describe('DashboardChannelsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DashboardChannelsService = TestBed.get(DashboardChannelsService);
    expect(service).toBeTruthy();
  });
});
