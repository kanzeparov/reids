import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { AppState } from '@app/app.state';

import * as GravatarActions from '../store/gravatar.actions';
import { GravatarsCollection } from '../store/gravatar.model';
import { GravatarService } from '../services/gravatar.service';

@Injectable()
export class GravatarActionsService {

  constructor(
    private store$: Store<AppState>,
    private gravatarService: GravatarService,
  ) { }

  addCollection(uuids: string[]) {
    const collection: GravatarsCollection = uuids.reduce((memo, uuid: string) => {
      return { ...memo, [uuid]: this.gravatarService.generate(uuid) };
    }, {});

    return this.store$.dispatch(new GravatarActions.AddCollection(collection));
  }
}
