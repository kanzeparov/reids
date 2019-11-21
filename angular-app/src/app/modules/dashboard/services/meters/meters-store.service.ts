import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { AppState } from '@app/app.state';

import * as MetersStore from '@store/meters/meters.actions';
import { MetersCollection, MeterRelations } from '@store/meters/meter.model';
import {
  selectMeterByUuid,
  selectMetersCollection,
  selectSortedMeters,
} from '@store/meters/meters.selectors';

import { ApiMeter, ApiMeterRelation } from '../../models/api-meter.model';
import { GravatarStoreService } from '@core/services/gravatar-store.service';

@Injectable()
export class MetersStoreService {

  constructor(
    private store$: Store<AppState>,
    private gravatarStore: GravatarStoreService,
  ) { }

  /* Getters */

  getSortedMeters() {
    return this.store$.pipe(select(selectSortedMeters));
  }

  getMeters() {
    return this.store$.pipe(select(selectMetersCollection));
  }

  getMeterByUuid(uuid: string) {
    return this.store$.pipe(select(selectMeterByUuid, uuid));
  }

  /* Actions */

  addCollection = (apiMeters: ApiMeter[]) => {
    this.addGravatarsCollection(apiMeters);

    const collection: MetersCollection = apiMeters.reduce((memo, meter: ApiMeter) => {
      return { ...memo, [meter.uuid]: meter };
    }, {});

    return this.store$.dispatch(new MetersStore.AddCollection(collection));
  }

  addRelations = (apiRelations: ApiMeterRelation[]) => {
    const relations: MeterRelations = apiRelations.reduce((memo, mr: ApiMeterRelation) => {
      return {
        ...memo,
        [mr.sellerUuid]: [
          ...memo[mr.sellerUuid] || [],
          mr.meterUuid,
        ]
      };
    }, {});

    return this.store$.dispatch(new MetersStore.AddRelations(relations));
  }

  private addGravatarsCollection(apiMeters: ApiMeter[]) {
    const uuids = apiMeters.map((m: ApiMeter) => m.uuid);

    this.gravatarStore.addCollection(uuids);
  }
}
