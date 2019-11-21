import { createSelector, createFeatureSelector } from '@ngrx/store';

import { AppState } from '@app/app.state';
import { GravatarState } from './gravatar.state';

import { GravatarsCollection } from './gravatar.model';

export const findGravatarByUuid = (gravatarsCollection: GravatarsCollection, uuid: string) => {
  return gravatarsCollection[uuid];
};

export const selectGravatar = createFeatureSelector<AppState, GravatarState>(
  'gravatar'
);

export const selectGravatarsCollection = createSelector(
  selectGravatar,
  (gravatarsState: GravatarState) => gravatarsState.collection
);

export const selectGravatarByUuid = createSelector(
  selectGravatarsCollection,
  findGravatarByUuid,
);
