import { Injectable } from '@angular/core';

import { BaseApiService } from '@core/services/base-api.service';
import { ApiRouterService } from '@core/services/api-router.service';

import { TransferPayload } from '@modules/web3/models/transfer.model';

@Injectable({
  providedIn: 'root'
})
export class TransferApiService {

  private transferPath = 'transfer';

  constructor(
    private baseApi: BaseApiService,
    private apiRouter: ApiRouterService,
  ) { }

  transfer$({ to, amount, tokenContract}: TransferPayload) {
    const url = this.apiRouter.buildPath(this.transferPath);
    const body = { to, amount, tokenContract };

    return this.baseApi.post$(url, { body, retriesCount: 0, retryDelay: 0 });
  }
}
