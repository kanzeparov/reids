import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import {
  selectChannelsCollection,
  selectChannelsList,
  selectOpenChannelsList,
} from '../store/channels.selectors';
import { AppState } from '@app/app.state';

@Injectable()
export class ChannelsSelectorsService {

  constructor(private store$: Store<AppState>) { }

  getAllChannels$() {
    return this.store$.pipe(select(selectChannelsList));
  }

  getOpenChannels$() {
    return this.store$.pipe(select(selectOpenChannelsList));
  }

  getChannelsCollection$() {
    return this.store$.pipe(select(selectChannelsCollection));
  }
}
