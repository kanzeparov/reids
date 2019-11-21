import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { channelsReducer } from './store/channels.reducer';

import { ChannelsActionsService } from './services/channels-actions.service';
import { ChannelsSelectorsService } from './services/channels-selectors.service';
import { ChannelsApiService } from './services/channels-api.service';

@NgModule({
  imports: [
    StoreModule.forFeature('channels', channelsReducer),
  ],
  providers: [
    ChannelsApiService,
    ChannelsActionsService,
    ChannelsSelectorsService,
  ],
})
export class ChannelsModule { }
