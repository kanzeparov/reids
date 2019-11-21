import { Injectable } from '@angular/core';
import { BaseApiService } from '@core/services/base-api.service';
import { ApiRouterService } from '@core/services/api-router.service';

@Injectable()
export class DeviceApiService {

  devicePath = '';

  constructor(
    private baseApi: BaseApiService,
    private apiRouter: ApiRouterService,
  ) { }

  getDeviceData$() {
    const url = this.apiRouter.buildPath(this.devicePath);
    return this.baseApi.get$(url);
  }

  pollDeviceData$() {
    const url = this.apiRouter.buildPath(this.devicePath);
    return this.baseApi.poll$(url, { pollAfterDelay: true, retriesCount: 20 });
  }
}
