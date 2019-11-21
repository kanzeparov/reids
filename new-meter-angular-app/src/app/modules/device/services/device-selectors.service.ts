import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { distinctUntilChanged, filter, map, pluck, takeWhile } from 'rxjs/operators';

import { AppState } from '@app/app.state';
import { BaseMeta } from '@core/store/base.model';

import { selectDeviceData, selectDeviceMeta } from '../store/device.selectors';
import { objectsAreEqual } from '@utils/object.util';

@Injectable()
export class DeviceSelectorsService {

  constructor(
    private store$: Store<AppState>,
  ) { }

  getDeviceData$() {
    return this.store$.pipe(select(selectDeviceData));
  }

  getMeta$() {
    return this.store$.pipe(
      select(selectDeviceMeta),
      distinctUntilChanged(objectsAreEqual),
    );
  }

  isLoading$() {
    return this.getMeta$().pipe(
      pluck('isLoading'),
    );
  }

  whenNotLoading$() {
    return this.isLoading$().pipe(
      filter((isLoading: boolean) => !isLoading),
      distinctUntilChanged(),
    );
  }

  isLoaded$() {
    return this.getMeta$().pipe(
      pluck('isLoaded'),
    );
  }

  whenLoaded$() {
    return this.isLoaded$().pipe(
      filter((isLoaded: boolean) => isLoaded),
      distinctUntilChanged(),
    );
  }

  untilLoaded$() {
    return this.getMeta$().pipe(
      takeWhile(({ isLoaded }: BaseMeta) => !isLoaded),
    );
  }

  isLoadFailed$() {
    return this.getMeta$().pipe(
      pluck('loadErrors'),
      map((loadErrors: string[]) => loadErrors.length > 0),
    );
  }
}
