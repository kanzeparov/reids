import { TestBed } from '@angular/core/testing';

import { TransferFlowService } from './transfer-flow.service';

describe('TransferFlowService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TransferFlowService = TestBed.get(TransferFlowService);
    expect(service).toBeTruthy();
  });
});
