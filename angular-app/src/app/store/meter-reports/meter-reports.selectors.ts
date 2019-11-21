import { createSelector, createFeatureSelector } from '@ngrx/store';

import { AppState } from '@app/app.state';
import { MeterReportsState } from './meter-reports.state';

export const selectReports = createFeatureSelector<AppState, MeterReportsState>(
  'meterReports'
);

export const selectMeterReportsCollection = createSelector(
  selectReports,
  (reports: MeterReportsState) => reports.collection
);
