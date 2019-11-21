import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { gravatarReducer } from './store/gravatar.reducer';

import { GravatarService } from './services/gravatar.service';
import { GravatarActionsService } from './services/gravatar-actions.service';
import { GravatarSelectorsService } from './services/gravatar-selectors.service';

@NgModule({
  imports: [
    StoreModule.forFeature('gravatar', gravatarReducer),
  ],
  providers: [
    GravatarService,
    GravatarActionsService,
    GravatarSelectorsService,
  ],
})
export class GravatarModule { }
