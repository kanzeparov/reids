import { createSelector, createFeatureSelector } from '@ngrx/store';

import { AppState } from '@app/app.state';
import { MetersState } from './meters.state';

import { MetersCollection, MeterRelations, MeterItem } from './meter.model';

export const findMeterByUuid = (meters: MetersCollection, uuid: string) => {
  return meters[uuid];
};

export const selectMeters = createFeatureSelector<AppState, MetersState>(
  'meters'
);

export const selectMetersCollection = createSelector(
  selectMeters,
  (metersState: MetersState) => metersState.collection
);

export const selectMetersRelations = createSelector(
  selectMeters,
  (meters: MetersState) => meters.relations
);

export const selectSortedMeters = createSelector(
  selectMetersCollection,
  selectMetersRelations,
  (meters: MetersCollection, relations: MeterRelations) => {
    const metersEmpty = Object.keys(meters).length === 0;
    const relationsEmpty = Object.keys(relations).length === 0;
    if (metersEmpty || relationsEmpty) {
      return [];
    }

    return Object.keys(relations)
      .reduce((memo, sellerUuid: string) => {
        const sellerMeter = { ...findMeterByUuid(meters, sellerUuid), isSeller: true };
        const buyerUuids = relations[sellerUuid];
        const buyerMeters = buyerUuids.map(findMeterByUuid.bind(null, meters));

        return [ ...memo, sellerMeter, ...buyerMeters ];
      }, []);
  }
);

export const selectMeterByUuid = createSelector(
  selectMetersCollection,
  findMeterByUuid,
);

export const getMeterName = createSelector(
  selectMetersCollection,
  (meters: MetersCollection) => {
    return (uuid: string) => {
      if (!meters[uuid]) {
        return null;
      }

      return meters[uuid].name;
    };
  }
);
