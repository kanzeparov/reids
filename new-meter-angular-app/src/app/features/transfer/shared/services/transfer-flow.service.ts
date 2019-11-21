import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import * as TransferFlow from '@features/transfer/shared/transfer-flow.actions';

@Injectable()
export class TransferFlowService {

  state$: BehaviorSubject<TransferFlow.ActionsUnion> = new BehaviorSubject(
    new TransferFlow.FlowNone()
  );

  constructor() { }

  get isPending$() {
    return this.state$.pipe(
      map((state => state instanceof TransferFlow.FlowPending))
    );
  }

  reset() {
    this.state$.next(
      new TransferFlow.FlowNone()
    );
  }

  preparing() {
    this.state$.next(
      new TransferFlow.FlowPreparing()
    );
  }

  pending() {
    this.state$.next(
      new TransferFlow.FlowPending()
    );
  }

  success(payload: TransferFlow.FlowSuccessPayload) {
    this.state$.next(
      new TransferFlow.FlowSuccess(payload)
    );
  }

  error(payload: TransferFlow.FlowErrorPayload) {
    this.state$.next(
      new TransferFlow.FlowError(payload)
    );
  }
}
