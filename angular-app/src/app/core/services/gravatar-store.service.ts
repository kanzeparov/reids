import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { AppState } from '@app/app.state';

import * as GravatarsStore from '@store/gravatars/gravatars.actions';
import { selectGravatarsCollection, selectGravatarByUuid } from '@store/gravatars/gravatars.selectors';
import { GravatarsCollection } from '@store/gravatars/gravatars.model';

import { GravatarService } from '@core/services/gravatar.service';

@Injectable({
  providedIn: 'root'
})
export class GravatarStoreService {

  constructor(
    private store$: Store<AppState>,
    private gravatarService: GravatarService,
  ) { }

  getGravatarByUuid(uuid: string) {
    return this.store$.pipe(select(selectGravatarByUuid, uuid));
  }

  getGravatars() {
    return this.store$.pipe(select(selectGravatarsCollection));
  }

  addCollection(uuids: string[]) {
    const collection: GravatarsCollection = uuids.reduce((memo, uuid: string) => {
      return { ...memo, [uuid]: this.gravatarService.generate(uuid) };
    }, {});

    return this.store$.dispatch(new GravatarsStore.AddCollection(collection));
  }
}
