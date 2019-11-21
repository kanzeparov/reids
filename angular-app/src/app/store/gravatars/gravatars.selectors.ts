import { createSelector, createFeatureSelector } from '@ngrx/store';

import { AppState } from '@app/app.state';
import { GravatarsState } from './gravatars.state';

import { GravatarsCollection } from './gravatars.model';

export const findGravatarByUuid = (gravatars: GravatarsCollection, uuid: string) => {
  return gravatars[uuid];
};

export const selectGravatars = createFeatureSelector<AppState, GravatarsState>(
  'gravatars'
);

export const selectGravatarsCollection = createSelector(
  selectGravatars,
  (gravatarsState: GravatarsState) => gravatarsState.collection
);

export const selectGravatarByUuid = createSelector(
  selectGravatarsCollection,
  findGravatarByUuid,
);
