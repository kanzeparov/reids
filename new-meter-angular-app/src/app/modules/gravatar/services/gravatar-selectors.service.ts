import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { AppState } from '@app/app.state';

import { selectGravatarByUuid, selectGravatarsCollection } from '../store/gravatar.selectors';

@Injectable()
export class GravatarSelectorsService {

  constructor(private store$: Store<AppState>) { }

  getGravatarByUuid$(uuid: string) {
    return this.store$.pipe(select(selectGravatarByUuid, uuid));
  }

  getGravatars$() {
    return this.store$.pipe(select(selectGravatarsCollection));
  }
}
