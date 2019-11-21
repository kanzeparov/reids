import { Injectable } from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { Effect } from '@ngrx/effects';

import { filter, tap } from 'rxjs/operators';

import * as TransferFlow from '@features/transfer/shared/transfer-flow.actions';
import { TransferFlowService } from '@features/transfer/shared/services/transfer-flow.service';

const ofFlowType = (type: TransferFlow.ActionType) => {
  return filter((action: TransferFlow.ActionsUnion) => {
    return action.type === type;
  });
};

@Injectable()
export class TransferEffects {

  RESET_FLOW_URLS = [
    '/deposit/success',
    '/deposit/error',
    '/withdraw/success',
    '/withdraw/error',
  ];

  constructor(
    private transferFlow: TransferFlowService,
    private router: Router,
  ) { }

  @Effect({ dispatch: false })
  $watchTransferSuccess = this.transferFlow.state$.pipe(
    ofFlowType(TransferFlow.ActionType.Success),
    tap((action: TransferFlow.FlowSuccess) => {
      const { redirectUrl, transactionHash } = action.payload;

      this.router.navigate([redirectUrl, { transactionHash }]);
    }),
  );

  @Effect({ dispatch: false })
  $watchTransferError = this.transferFlow.state$.pipe(
    ofFlowType(TransferFlow.ActionType.Error),
    tap((action: TransferFlow.FlowError) => {
      const { redirectUrl, errors } = action.payload;
      console.log(`Failed to perform transfer due to errors: ${errors}`);

      this.router.navigate([redirectUrl ]);
    }),
  );

  @Effect({ dispatch: false })
  $resetTransferFlow = this.router.events.pipe(
    filter((event: RouterEvent) => (
      event instanceof NavigationEnd &&
      this.RESET_FLOW_URLS.includes(event.url)
    )),
    tap(() => this.transferFlow.reset()),
  );

}
