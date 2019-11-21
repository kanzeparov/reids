import { NgModule } from '@angular/core';

import { ApiRouterService } from '@core/services/api-router.service';
import { BaseApiService } from '@core/services/base-api.service';
import { WebsocketService } from '@core/services/websocket.service';
// import { CommonModule } from '@angular/common';

@NgModule({
  providers: [
    ApiRouterService,
    BaseApiService,
    WebsocketService,
  ],
})
export class CoreModule { }
