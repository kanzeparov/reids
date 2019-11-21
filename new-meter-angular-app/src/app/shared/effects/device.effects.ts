import { Injectable } from '@angular/core';
import { NavigationStart, Router, RouterEvent } from '@angular/router';
import { Effect, Actions, ofType } from '@ngrx/effects';

import { of } from 'rxjs';
import { catchError, filter, first, switchMap, tap } from 'rxjs/operators';

import { DeviceApiService } from '@modules/device/services/device-api.service';
import { DeviceSelectorsService } from '@modules/device/services/device-selectors.service';
import { DeviceActionsService } from '@modules/device/services/device-actions.service';

import * as DeviceActions from '@modules/device/store/device.actions';
import { ApiDeviceResponse } from '@modules/device/api-device.model';

@Injectable()
export class DeviceEffects {

  DEVICE_LOAD_ROUTES = [
    '/',
    '/dashboard',
    '/deposit/form',
    '/withdraw/form',
  ];

  constructor(
    private actions$: Actions,
    private router: Router,
    private deviceSelectors: DeviceSelectorsService,
    private deviceActions: DeviceActionsService,
    private deviceApi: DeviceApiService,
  ) { }

  @Effect({ dispatch: false })
  $triggerDeviceLoad = this.router.events.pipe(
    filter((event: RouterEvent) => (
      event instanceof NavigationStart &&
      this.DEVICE_LOAD_ROUTES.includes(event.url)
    )),
    first(),

    tap(() => this.deviceActions.loadDevice()),
  );

  @Effect({ dispatch: false })
  $loadDeviceData = this.actions$.pipe(
    ofType(DeviceActions.ActionTypes.LoadDevice),

    switchMap(() => {
      return this.deviceApi.getDeviceData$().pipe(
        tap((apiDeviceResponse: ApiDeviceResponse) => {
          this.deviceActions.addToStore(apiDeviceResponse);
          this.deviceActions.loadSucceed();
        }),
        catchError((errorMsg: string) => {
          this.deviceActions.loadFailed([ errorMsg ]);

          return of([ errorMsg ]);
        }),
      );
    }),
  );

}
