import { Injectable } from '@angular/core';
import { ApiCloseChannelResponse } from '../api-channel.model';

import { BaseApiService } from '@core/services/base-api.service';
import { ApiRouterService } from '@core/services/api-router.service';

@Injectable()
export class ChannelsApiService {

  private closeChannelPath = 'channels/{channel}';

  constructor(
    private baseApi: BaseApiService,
    private apiRouter: ApiRouterService,
  ) { }

  closeChannel(channelUuid: string) {
    const url = this.apiRouter.buildPath(this.closeChannelPath, { channel: channelUuid });
    const body = {};

    return this.baseApi.delete$<ApiCloseChannelResponse>(url, { body });
  }
}
